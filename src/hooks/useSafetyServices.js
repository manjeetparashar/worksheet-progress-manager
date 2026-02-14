import { useState, useRef, useEffect } from 'react';
import { SafeStorage } from '../utils/storage';
import { safeJSONParse, historyCompress, generateId } from '../utils/helpers';

export const useSafetyServices = ({ state }) => {
    const [telemetry, setTelemetry] = useState(() => safeJSONParse(SafeStorage.getItem('ws_perf_history') || '[]') || []);
    const appStartTsRef = useRef(performance.now());
    const firstInputCapturedRef = useRef(false);
    const hydrationRecordedRef = useRef(false);
    const lastBackupTsRef = useRef(0);

    useEffect(() => {
        SafeStorage.setItem('ws_perf_history', JSON.stringify(telemetry));
    }, [telemetry]);

    useEffect(() => {
        if (!state || hydrationRecordedRef.current) return;
        hydrationRecordedRef.current = true;
        const hydrationMs = Math.round(performance.now() - appStartTsRef.current);
        setTelemetry(prev => {
            const next = [...prev];
            if (next[0] && next[0].hydrationMs === null) {
                next[0] = { ...next[0], hydrationMs };
                return next.slice(0, 30);
            }
            return [{ id: generateId(), ts: new Date().toISOString(), firstInputMs: null, hydrationMs }, ...next].slice(0, 30);
        });
    }, [state]);

    useEffect(() => {
        const captureFirstInput = () => {
            if (firstInputCapturedRef.current) return;
            firstInputCapturedRef.current = true;
            const firstInputMs = Math.round(performance.now() - appStartTsRef.current);
            setTelemetry(prev => [
                { id: generateId(), ts: new Date().toISOString(), firstInputMs, hydrationMs: null },
                ...prev
            ].slice(0, 30));
        };
        window.addEventListener('keydown', captureFirstInput, { once: true });
        window.addEventListener('mousedown', captureFirstInput, { once: true });
        return () => {
            window.removeEventListener('keydown', captureFirstInput);
            window.removeEventListener('mousedown', captureFirstInput);
        };
    }, []);

    useEffect(() => {
        if (!state) return;
        const now = Date.now();
        if (now - lastBackupTsRef.current < 30000) return;
        lastBackupTsRef.current = now;
        try {
            const existing = safeJSONParse(SafeStorage.getItem('ws_rotating_backups') || '[]') || [];
            const retentionMs = 14 * 24 * 60 * 60 * 1000;
            const recent = existing.filter(b => now - new Date(b.createdAt).getTime() < retentionMs);
            const next = [{ id: generateId(), createdAt: new Date().toISOString(), payload: historyCompress(state) }, ...recent].slice(0, 20);
            SafeStorage.setItem('ws_rotating_backups', JSON.stringify(next));
        } catch {}
    }, [state]);

    return { telemetry, setTelemetry };
};
