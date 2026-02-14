const TRACE_KEY = 'ws_perf_trace';

const now = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

const getStore = () => {
    if (typeof window === 'undefined') return null;
    if (!window.__wsPerfTraceStats) window.__wsPerfTraceStats = {};
    return window.__wsPerfTraceStats;
};

export const isPerfTraceEnabled = () => {
    if (typeof window === 'undefined') return false;
    try {
        return window.localStorage.getItem(TRACE_KEY) === 'true';
    } catch {
        return false;
    }
};

export const traceCompute = (name, fn) => {
    if (!isPerfTraceEnabled()) return fn();
    const start = now();
    const result = fn();
    const durationMs = now() - start;
    const store = getStore();
    if (store) {
        const prev = store[name] || { count: 0, totalMs: 0, maxMs: 0, lastMs: 0 };
        const next = {
            count: prev.count + 1,
            totalMs: prev.totalMs + durationMs,
            maxMs: Math.max(prev.maxMs, durationMs),
            lastMs: durationMs
        };
        store[name] = next;
    }
    if (durationMs >= 4) {
        console.debug(`[perf-trace] ${name}: ${durationMs.toFixed(2)}ms`);
    }
    return result;
};
