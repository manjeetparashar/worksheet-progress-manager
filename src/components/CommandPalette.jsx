import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';

export const CommandPalette = ({isOpen, onClose, actions}) => {
    const USAGE_KEY = 'ws_command_palette_usage';
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [usage, setUsage] = useState(() => {
        try {
            const raw = localStorage.getItem(USAGE_KEY);
            if (!raw) return { counts: {}, recent: [] };
            const parsed = JSON.parse(raw);
            return {
                counts: parsed?.counts || {},
                recent: Array.isArray(parsed?.recent) ? parsed.recent : []
            };
        } catch {
            return { counts: {}, recent: [] };
        }
    });

    const getActionKey = (action) => `${action.label}::${action.sub || ''}`;

    const filtered = useMemo(() => {
        if (!isOpen) return [];
        const q = query.toLowerCase();
        const rank = (key) => {
            const countScore = (usage.counts[key] || 0) * 10;
            const recentIndex = usage.recent.indexOf(key);
            const recentScore = recentIndex === -1 ? 0 : Math.max(0, 30 - recentIndex);
            return countScore + recentScore;
        };

        const pool = actions
            .filter(a => q === '' || a.label.toLowerCase().includes(q) || (a.sub && a.sub.toLowerCase().includes(q)))
            .map(a => ({ ...a, _k: getActionKey(a) }))
            .sort((a, b) => {
                const scoreDiff = rank(b._k) - rank(a._k);
                if (scoreDiff !== 0) return scoreDiff;
                return a.label.localeCompare(b.label);
            });

        return pool.slice(0, q ? 15 : 20);
    }, [query, isOpen, actions, usage]);

    useEffect(() => {
        if (isOpen) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = originalStyle; };
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                onClose();
                setQuery('');
            }
        };

        const handleKeyDownGlobal = (e) => {
            if (e.key === 'Escape') {
                onClose();
                setQuery('');
            }
        };

        document.addEventListener('mousedown', handleOutsideClick, true);
        document.addEventListener('keydown', handleKeyDownGlobal, true);
        
        setSelectedIdx(0);
        if (inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 10);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick, true);
            document.removeEventListener('keydown', handleKeyDownGlobal, true);
        };
    }, [isOpen, onClose]); 

    useEffect(() => {
        if (isOpen) setSelectedIdx(0);
    }, [query, isOpen]);

    const execute = (action) => {
        if (action) {
            action.action();
            const key = getActionKey(action);
            setUsage(prev => {
                const next = {
                    counts: {
                        ...prev.counts,
                        [key]: (prev.counts[key] || 0) + 1
                    },
                    recent: [key, ...prev.recent.filter(r => r !== key)].slice(0, 50)
                };
                try {
                    localStorage.setItem(USAGE_KEY, JSON.stringify(next));
                } catch {}
                return next;
            });
        }
        onClose();
        setQuery('');
    };
    
    const handleKey = (e) => {
        if (filtered.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIdx(i => (i + 1) % filtered.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIdx(i => (i - 1 + filtered.length) % filtered.length);
                break;
            case 'Enter':
                e.preventDefault();
                if (filtered[selectedIdx]) {
                    execute(filtered[selectedIdx]);
                }
                break;
            case 'Tab':
                e.preventDefault(); 
                break;
            case 'Escape':
                e.stopPropagation();
                onClose();
                setQuery('');
                break;
        }
    };

    if(!isOpen) return null;

    const content = (
        <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
             onClick={onClose}>
            <div ref={containerRef}
                 role="combobox"
                 aria-haspopup="listbox"
                 aria-expanded="true"
                 aria-owns="command-palette-results"
                 onClick={e => e.stopPropagation()}
                 className="bg-[var(--bg-class)] rounded-xl shadow-2xl w-full max-w-2xl border border-[var(--border-subtle)] overflow-hidden my-auto">
                <input ref={inputRef} 
                       type="text" 
                       role="searchbox"
                       aria-autocomplete="list"
                       aria-controls="command-palette-results"
                       aria-activedescendant={filtered.length > 0 ? `command-option-${selectedIdx}` : undefined}
                       placeholder="Jump to..." 
                       value={query} 
                       onChange={e => setQuery(e.target.value)} 
                       onKeyDown={handleKey} 
                       className="w-full px-5 py-4 text-xl border-b border-[var(--border-subtle)] outline-none bg-[var(--bg-subject)] focus:bg-[var(--bg-class)] transition-colors text-[var(--text-main)] font-medium" />
                <div id="command-palette-results"
                     role="listbox"
                     aria-label="Command palette results"
                     className="max-h-[50vh] overflow-y-auto cp-scroll">
                    {filtered.map((item, i) => ( 
                        <div key={i} 
                             id={`command-option-${i}`}
                             role="option"
                             aria-selected={i === selectedIdx}
                             className={`px-5 py-3 cursor-pointer flex items-center justify-between transition-colors ${i === selectedIdx ? 'bg-[#262624] text-[#C2C0B6]' : 'bg-[#C2C0B6] text-[#262624] hover:bg-[#262624] hover:text-[#C2C0B6]'}`} 
                             onClick={() => execute(item)}> 
                            <div className="flex-1 overflow-hidden">
                                <div className="font-bold text-base truncate">{item.label}</div>
                            </div>
                            {item.sub && (
                                <div className={`text-[10px] px-2 py-1 rounded font-black uppercase tracking-wider ml-4 whitespace-nowrap ${i===selectedIdx ? 'bg-[#C2C0B6] text-[#262624]' : 'bg-[#262624] text-[#C2C0B6]'}`}>
                                    {item.sub}
                                </div>
                            )}
                        </div> 
                    ))}
                    
                    {filtered.length === 0 && (
                        <div className="px-5 py-10 text-center text-[var(--text-muted)] font-bold italic">
                            No commands found for "{query}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(content, document.body);
};
