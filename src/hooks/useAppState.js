import { useState, useEffect, useCallback, useRef } from 'react';
import { SafeStorage, IDBService } from '../utils/storage';
import { historyCompress, safeJSONParse, debounce, generateId } from '../utils/helpers';
import { DataImportService, DataMigrationService } from '../utils/data';
import { AppStateSchema } from '../utils/schema';
import { DB_KEY, DATA_VERSION, TEMPLATE_VERSION, DEFAULT_TEMPLATE } from '../constants';

const defaultState = {
    version: DATA_VERSION,
    templateVersion: TEMPLATE_VERSION,
    classes: [],
    template: DEFAULT_TEMPLATE,
    userProfile: { name: 'User' },
    quickInbox: []
};

export const useAppState = ({ keymapMode, toast }) => {
    const [state, setState] = useState(null);
    const [history, setHistory] = useState([]);
    const [histIdx, setHistIdx] = useState(-1);

    const histIdxRef = useRef(-1);
    const isReadOnlyRef = useRef(false);
    const readOnlyNoticeTsRef = useRef(0);

    const debouncedPersist = useCallback(
        debounce((nextState) => { IDBService.put(DB_KEY, JSON.stringify(nextState)); }, 1000),
        []
    );

    useEffect(() => {
        isReadOnlyRef.current = keymapMode === 'review';
    }, [keymapMode]);

    useEffect(() => {
        histIdxRef.current = histIdx;
    }, [histIdx]);

    const updateState = useCallback((update, skipHistory = false, forcePersist = false) => {
        if (isReadOnlyRef.current) {
            const now = Date.now();
            if (now - readOnlyNoticeTsRef.current > 1200) {
                readOnlyNoticeTsRef.current = now;
                toast('Review mode lock is active (read-only)', 'info');
            }
            return;
        }

        setState(prev => {
            const next = typeof update === 'function' ? update(prev) : update;
            if (!skipHistory) {
                setHistory(prevHistory => {
                    const nh = prevHistory.slice(0, histIdxRef.current + 1);
                    nh.push(historyCompress(next));
                    if (nh.length > 20) nh.shift();
                    const nextIdx = nh.length - 1;
                    histIdxRef.current = nextIdx;
                    setHistIdx(nextIdx);
                    return nh;
                });
            }
            try { localStorage.setItem('ws_dirty_state', JSON.stringify(next)); } catch {}
            if (forcePersist) IDBService.put(DB_KEY, JSON.stringify(next));
            else debouncedPersist(next);
            return next;
        });
    }, [debouncedPersist, toast]);

    const applyOperation = useCallback((label, updater, setOperationJournal) => {
        updateState(prev => {
            const next = updater(prev);
            setOperationJournal(j => [
                { id: generateId(), label, snapshot: historyCompress(prev), createdAt: new Date().toISOString() },
                ...j
            ].slice(0, 25));
            return next;
        });
    }, [updateState]);

    useEffect(() => {
        (async () => {
            const dirty = SafeStorage.getItem('ws_dirty_state');
            const saved = await IDBService.get(DB_KEY);
            let rawData = safeJSONParse(dirty) || safeJSONParse(saved) || defaultState;

            if (rawData.version < DATA_VERSION) rawData = DataImportService.migrateData(rawData);
            if (!rawData._timestampsMigrated) rawData = DataMigrationService.ensureTimestamps(rawData);
            rawData = DataMigrationService.repairCorruptedLabels(rawData);

            const validation = AppStateSchema.safeParse(rawData);
            const init = validation.success ? validation.data : defaultState;
            if (!validation.success) console.error('Initial state validation failed:', validation.error);

            const initialHistory = [historyCompress(init)];
            setState(init);
            setHistory(initialHistory);
            setHistIdx(0);
            histIdxRef.current = 0;
        })();
    }, []);

    return {
        state,
        setState,
        history,
        histIdx,
        setHistIdx,
        updateState,
        applyOperation
    };
};
