import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';

const ShortcutContext = createContext(null);

export const ShortcutProvider = ({ children }) => {
    const STORAGE_KEY = 'ws_shortcut_overrides';
    const registrations = useRef(new Map());
    const shortcuts = useRef(new Map());
    const normalize = (combo) => combo.toLowerCase().replace(/\s+/g, '');
    const [overrides, setOverrides] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        } catch {
            return {};
        }
    });

    const rebuildShortcutMap = useCallback((nextOverrides = overrides) => {
        const map = new Map();
        registrations.current.forEach((shortcut) => {
            const finalCombo = nextOverrides[shortcut.id] || shortcut.defaultCombo;
            const key = normalize(finalCombo);
            map.set(key, { ...shortcut, original: finalCombo });
        });
        shortcuts.current = map;
    }, [overrides]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
        rebuildShortcutMap(overrides);
    }, [overrides, rebuildShortcutMap]);

    const register = useCallback((combo, handler, description = '', category = 'General', id = null) => {
        const shortcutId = id || `${category}:${description}:${combo}`;
        registrations.current.set(shortcutId, {
            id: shortcutId,
            defaultCombo: combo,
            handler,
            description,
            category
        });
        rebuildShortcutMap();
        return () => {
            registrations.current.delete(shortcutId);
            rebuildShortcutMap();
        };
    }, [rebuildShortcutMap]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore modifiers only
            if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;

            // Don't trigger if user is typing in an input (unless it's a special global like Ctrl+K)
            const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable;
            
            // Build combo string
            const parts = [];
            if (e.ctrlKey) parts.push('ctrl');
            if (e.altKey) parts.push('alt');
            if (e.shiftKey) parts.push('shift');
            if (e.metaKey) parts.push('meta');
            parts.push(e.key.toLowerCase());
            
            const combo = parts.join('+');
            const shortcut = shortcuts.current.get(combo);

            if (shortcut) {
                // If it's an input, only allow specific "Global" shortcuts (usually mostly Ctrl/Alt mods)
                // For now, we trust the definition. Maybe add a 'global' flag later if needed.
                // Generally Ctrl+K works in inputs. Single letter keys do not.
                if (isInput && !e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) return;

                e.preventDefault();
                shortcut.handler(e);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const getShortcuts = useCallback(() => {
        return Array.from(registrations.current.values()).map(s => ({
            id: s.id,
            combo: overrides[s.id] || s.defaultCombo,
            defaultCombo: s.defaultCombo,
            description: s.description,
            category: s.category,
            handler: s.handler
        }));
    }, [overrides]);

    const getShortcutConflicts = useCallback((targetId = null, combo = null) => {
        const usage = new Map();
        Array.from(registrations.current.values()).forEach(s => {
            const finalCombo = combo && s.id === targetId ? combo : (overrides[s.id] || s.defaultCombo);
            const key = normalize(finalCombo);
            if (!usage.has(key)) usage.set(key, []);
            usage.get(key).push(s.id);
        });
        return Array.from(usage.entries()).filter(([, ids]) => ids.length > 1).map(([key, ids]) => ({ combo: key, ids }));
    }, [overrides]);

    const setShortcutBinding = useCallback((shortcutId, combo) => {
        const nextCombo = normalize(combo);
        const nextOverrides = { ...overrides };
        if (!nextCombo) delete nextOverrides[shortcutId];
        else nextOverrides[shortcutId] = nextCombo;
        const conflicts = (() => {
            const usage = new Map();
            Array.from(registrations.current.values()).forEach(s => {
                const finalCombo = s.id === shortcutId ? (nextCombo || s.defaultCombo) : (nextOverrides[s.id] || s.defaultCombo);
                const key = normalize(finalCombo);
                if (!usage.has(key)) usage.set(key, []);
                usage.get(key).push(s.id);
            });
            return Array.from(usage.entries()).filter(([, ids]) => ids.length > 1);
        })();
        if (conflicts.length > 0) {
            return { ok: false, conflicts };
        }
        setOverrides(nextOverrides);
        return { ok: true, conflicts: [] };
    }, [overrides]);

    const resetShortcutBindings = useCallback(() => {
        setOverrides({});
    }, []);

    return (
        <ShortcutContext.Provider value={{ register, getShortcuts, setShortcutBinding, getShortcutConflicts, resetShortcutBindings }}>
            {children}
        </ShortcutContext.Provider>
    );
};

export const useShortcuts = () => {
    const context = useContext(ShortcutContext);
    if (!context) {
        throw new Error("useShortcuts must be used within a ShortcutProvider");
    }
    return context;
};

// Hook for a component to register a shortcut
export const useRegisterShortcut = (combo, handler, description, category, id = null) => {
    const { register } = useShortcuts();
    useEffect(() => {
        return register(combo, handler, description, category, id);
    }, [combo, handler, description, category, register, id]);
};
