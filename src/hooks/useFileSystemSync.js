import { useState, useCallback, useEffect, useRef } from 'react';
import { debounce } from '../utils/helpers';

export const useFileSystemSync = (state) => {
    const [fileHandle, setFileHandle] = useState(null);
    const [syncStatus, setSyncStatus] = useState('idle'); // idle, saving, saved, error
    const [lastSaved, setLastSaved] = useState(null);

    // Keep latest saveToFile and fileHandle in a ref so the debounced function 
    // always sees the current values without being recreated.
    const contextRef = useRef({ fileHandle, saveToFile: null });

    const saveToFile = useCallback(async (content) => {
        const handle = contextRef.current.fileHandle;
        if (!handle) return;

        try {
            setSyncStatus('saving');
            const writable = await handle.createWritable();
            await writable.write(JSON.stringify(content, null, 2));
            await writable.close();
            setSyncStatus('saved');
            setLastSaved(new Date());
            
            setTimeout(() => setSyncStatus('saved'), 2000);
        } catch (err) {
            console.error('Save failed:', err);
            setSyncStatus('error');
        }
    }, []);

    // Update the context ref whenever state-dependent values change
    useEffect(() => {
        contextRef.current = { fileHandle, saveToFile };
    }, [fileHandle, saveToFile]);

    // Create the stable debounced function ONCE
    const debouncedSaveRef = useRef(
        debounce((currentState) => {
            if (contextRef.current.fileHandle) {
                saveToFile(currentState);
            }
        }, 2000)
    );

    const connect = useCallback(async () => {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: 'worksheet-data.json',
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] },
                }],
            });
            setFileHandle(handle);
            setSyncStatus('connected');
            return true;
        } catch (err) {
            console.error('File access denied:', err);
            return false;
        }
    }, []);

    // Trigger save when state changes
    useEffect(() => {
        if (fileHandle && state) {
            debouncedSaveRef.current(state);
        }
    }, [state, fileHandle]);

    return {
        connect,
        syncStatus,
        lastSaved,
        isConnected: !!fileHandle
    };
};