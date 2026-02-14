import React, { useMemo, useState } from 'react';
import { Modal } from './Modal';
import { useShortcuts } from '../hooks/useShortcuts.jsx';

export const KeyboardHelp = ({ isOpen, onClose }) => {
    const { getShortcuts, setShortcutBinding, getShortcutConflicts, resetShortcutBindings } = useShortcuts();
    const [editMode, setEditMode] = useState(false);
    const [drafts, setDrafts] = useState({});
    const [status, setStatus] = useState('');
    const shortcuts = getShortcuts();

    const handleTrigger = (handler) => {
        onClose();
        setTimeout(() => handler(), 50);
    };

    const categoryMap = {
        'Navigation': '#4F6F52',
        'Editing': '#607274',
        'Flow': '#739072',
        'System': '#A27B5C',
        'General': '#739072'
    };

    const conflicts = useMemo(() => getShortcutConflicts(), [shortcuts]);
    const grouped = shortcuts.reduce((acc, s) => {
        const cat = s.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(s);
        return acc;
    }, {});
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Shortcuts" tiny={true}>
            <>
                <div className="max-h-[65vh] overflow-y-auto cp-scroll pr-1 flex flex-col gap-2 pb-1">
                    {conflicts.length > 0 && (
                        <div className="text-[8px] font-bold text-[var(--status-low-text)] bg-[var(--status-low-bg)] border border-[var(--status-low-text)] rounded px-2 py-1">
                            Shortcut conflict detected. Resolve before using new bindings.
                        </div>
                    )}
                    {Object.entries(grouped).map(([category, items]) => (
                        <div key={category} className="space-y-[1px]">
                                                                                                                                                                            <div className="flex items-center shadow-sm"
                                                                                                                                                                                 style={{ backgroundColor: categoryMap[category] }}>
                                                                                                                                                                                <h4 className="text-[5.5px] uppercase tracking-[0.05em] text-[#F0EEE6] px-0.5 py-0 leading-none">
                                                                                                                                                                                    {category}
                                                                                                                                                                                </h4>
                                                                                                                                                                            </div>                            <div className="flex flex-col gap-0.5">
                                {items.map((s, i) => (
                                <button key={i} 
                                        onClick={() => { if (!editMode) handleTrigger(s.handler); }}
                                        className="group flex items-center w-full py-1 px-2 rounded bg-[#F0EEE6] hover:shadow-sm transition-all border-l-[3px]"
                                        style={{ borderLeftColor: categoryMap[category] }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = categoryMap[category];
                                            e.currentTarget.querySelector('.s-desc').style.color = '#F0EEE6';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#F0EEE6';
                                            e.currentTarget.querySelector('.s-desc').style.color = categoryMap[category];
                                        }}
                                >
                                                                                                                                                                                {editMode ? (
                                                                                                                                                                                    <input
                                                                                                                                                                                        value={drafts[s.id] ?? s.combo}
                                                                                                                                                                                        onChange={(e) => setDrafts(p => ({ ...p, [s.id]: e.target.value }))}
                                                                                                                                                                                        onBlur={() => {
                                                                                                                                                                                            const next = drafts[s.id];
                                                                                                                                                                                            if (next === undefined || next === s.combo) return;
                                                                                                                                                                                            const result = setShortcutBinding(s.id, next);
                                                                                                                                                                                            if (!result.ok) {
                                                                                                                                                                                                setStatus(`Conflict on ${next}`);
                                                                                                                                                                                                setDrafts(p => ({ ...p, [s.id]: s.combo }));
                                                                                                                                                                                            } else {
                                                                                                                                                                                                setStatus(`Updated: ${s.description}`);
                                                                                                                                                                                            }
                                                                                                                                                                                        }}
                                                                                                                                                                                        className="w-16 py-0.5 px-1 rounded font-black text-[8px] bg-[#afafaf] text-[#000000] text-center border border-[#ffffff20] shrink-0"
                                                                                                                                                                                    />
                                                                                                                                                                                ) : (
                                                                                                                                                                                    <kbd className="w-16 py-0.5 rounded font-black text-[8px] bg-[#afafaf] text-[#000000] text-center border border-[#ffffff20] shrink-0 group-hover:bg-[#F0EEE6] group-hover:text-[#000000] transition-all">
                                                                                                                                                                                        {s.combo}
                                                                                                                                                                                    </kbd>
                                                                                                                                                                                )}
                                    <div className="ml-2 flex-1 overflow-hidden">
                                        <span className="s-desc text-[9px] font-bold tracking-tighter transition-colors truncate block"
                                              style={{ color: categoryMap[category] }}>
                                            {s.description}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    ))}
                </div>
                <div className="mt-1 flex gap-1">
                    <button onClick={() => setEditMode(v => !v)} className="px-2 py-1 rounded text-[9px] btn-high-speed btn-manage">{editMode ? 'Done' : 'Customize'}</button>
                    <button onClick={() => { resetShortcutBindings(); setDrafts({}); setStatus('Shortcut bindings reset'); }} className="px-2 py-1 rounded text-[9px] btn-high-speed btn-data">Reset</button>
                    {status && <span className="text-[8px] text-[var(--text-muted)] self-center">{status}</span>}
                </div>
                <div className="mt-2 py-1.5 bg-[#30302E] rounded-md text-center shadow-lg border border-[#44403C] flex justify-between items-center px-3">
                    <span className="text-[7px] font-black uppercase tracking-[0.4em] text-[#F0EEE6]">
                        Worksheet Manager
                    </span>
                    <span className="text-[7px] font-mono text-[#F0EEE6] opacity-50">
                        v48.54
                    </span>
                </div>
            </>
        </Modal>
    );
};
