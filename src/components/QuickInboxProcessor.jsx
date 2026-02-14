import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generateId } from '../utils/helpers';
import { useRegisterShortcut } from '../hooks/useShortcuts.jsx';

export const QuickInboxProcessor = ({ inboxItems, classes, onUpdateState, onToast }) => {
    const [processingItem, setProcessingItem] = useState(null);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [selectedInboxId, setSelectedInboxId] = useState(null);
    const confirmBtnRef = useRef(null);

    // Auto-select single options
    useEffect(() => {
        if (!selectedClass && classes.length === 1) setSelectedClass(classes[0].id);
    }, [classes, selectedClass]);

    useEffect(() => {
        if (selectedClass) {
            const cls = classes.find(c => c.id === selectedClass);
            if (cls && cls.subjects.length === 1 && !selectedSubject) setSelectedSubject(cls.subjects[0].id);
        }
    }, [selectedClass, classes, selectedSubject]);

    // Focus management
    useEffect(() => {
        if (processingItem && confirmBtnRef.current) {
            confirmBtnRef.current.focus();
        }
    }, [processingItem]);

    useEffect(() => {
        if (inboxItems.length === 0) {
            setSelectedInboxId(null);
            return;
        }
        if (!selectedInboxId || !inboxItems.some(i => i.id === selectedInboxId)) {
            setSelectedInboxId(inboxItems[0].id);
        }
    }, [inboxItems, selectedInboxId]);

    const processItem = (item) => {
        if (!selectedClass || !selectedSubject) {
            onToast('Please select a Class and Subject first.', 'error');
            return;
        }

        const isNewTopic = !selectedTopic || selectedTopic === '__new__';
        
        if (isNewTopic) {
            const newTopic = { id: generateId(), title: item.text, items: [], priority: 'Medium', collapsed: false, createdAt: new Date().toISOString() };
            onUpdateState(prev => ({ ...prev, classes: prev.classes.map(c => c.id === selectedClass ? { ...c, subjects: c.subjects.map(s => s.id === selectedSubject ? { ...s, topics: [...s.topics, newTopic] } : s) } : c), quickInbox: prev.quickInbox.filter(i => i.id !== item.id) }));
            onToast('Created new topic from inbox item', 'success');
        } else {
            const newItem = { id: generateId(), label: item.text, checked: false, createdAt: new Date().toISOString() };
            onUpdateState(prev => ({ ...prev, classes: prev.classes.map(c => c.id === selectedClass ? { ...c, subjects: c.subjects.map(s => s.id === selectedSubject ? { ...s, topics: s.topics.map(t => t.id === selectedTopic ? { ...t, items: [...t.items, newItem] } : t) } : s) } : c), quickInbox: prev.quickInbox.filter(i => i.id !== item.id) }));
            onToast('Added item to existing topic', 'success');
        }
        setProcessingItem(null);
    };

    const processSelectedItem = useCallback(() => {
        if (inboxItems.length === 0) return;
        const target = inboxItems.find(i => i.id === selectedInboxId) || inboxItems[0];
        if (!target) return;
        setProcessingItem(target);
        processItem(target);
    }, [inboxItems, selectedInboxId, selectedClass, selectedSubject, selectedTopic, classes]);

    const moveSelection = useCallback((direction) => {
        if (inboxItems.length === 0) return;
        const idx = inboxItems.findIndex(i => i.id === selectedInboxId);
        const nextIdx = idx === -1 ? 0 : (idx + direction + inboxItems.length) % inboxItems.length;
        setSelectedInboxId(inboxItems[nextIdx].id);
    }, [inboxItems, selectedInboxId]);

    useRegisterShortcut('ctrl+shift+enter', processSelectedItem, 'Process Selected Inbox Item', 'Flow');
    useRegisterShortcut('ctrl+shift+j', () => moveSelection(1), 'Inbox Select Next', 'Flow');
    useRegisterShortcut('ctrl+shift+k', () => moveSelection(-1), 'Inbox Select Previous', 'Flow');

    const handleKeyDown = (e, item) => {
        if (e.key === 'Enter') { e.stopPropagation(); processItem(item); }
        if (e.key === 'Escape') { e.stopPropagation(); setProcessingItem(null); }
    };

    const currentClass = classes.find(c => c.id === selectedClass);
    const currentSubject = currentClass?.subjects.find(s => s.id === selectedSubject);
    const isReady = selectedClass && selectedSubject;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[var(--bg-subject)] rounded-lg border border-[var(--border-subtle)]">
                <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider">1. Class</label>
                    <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSubject(''); setSelectedTopic(''); }} className="w-full px-3 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded text-[var(--text-main)] font-medium outline-none focus:ring-2 focus:ring-[var(--border-focus)] transition-all cursor-pointer hover:border-[var(--text-accent)]">
                        <option value="">Select Class...</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider">2. Subject</label>
                    <select value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedTopic(''); }} className="w-full px-3 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded text-[var(--text-main)] font-medium outline-none focus:ring-2 focus:ring-[var(--border-focus)] transition-all disabled:opacity-50 cursor-pointer hover:border-[var(--text-accent)]" disabled={!selectedClass}>
                        <option value="">Select Subject...</option>
                        {currentClass?.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider">3. Action</label>
                    <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)} className="w-full px-3 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded text-[var(--text-main)] font-medium outline-none focus:ring-2 focus:ring-[var(--border-focus)] transition-all disabled:opacity-50 cursor-pointer hover:border-[var(--text-accent)]" disabled={!selectedSubject}>
                        <option value="">✨ Create New Topic</option>
                        {currentSubject?.topics.length > 0 && <option disabled>──────────</option>}
                        {currentSubject?.topics.map(t => <option key={t.id} value={t.id}>Add to: {t.title}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-3">
                {inboxItems.map((item, idx) => (
                    <div key={idx} className={`border rounded-lg p-4 transition-all group ${processingItem?.id === item.id || selectedInboxId === item.id ? 'bg-[var(--selection-bg)] border-[var(--text-accent)] ring-1 ring-[var(--text-accent)]' : 'bg-[var(--bg-app)] border-[var(--border-subtle)] hover:bg-[var(--bg-subject)]'}`}>
                        <div className="flex justify-between items-center">
                            <div className="text-sm font-bold text-[var(--text-main)] flex-1">{item.text}</div>
                            <div className="flex gap-2 ml-4">
                                {processingItem?.id === item.id ? (
                                    <div className="flex gap-2 items-center animate-in fade-in slide-in-from-right-2">
                                        <span className="text-xs text-[var(--text-muted)] mr-2 hidden md:inline">Press Enter to Confirm</span>
                                        <button 
                                            ref={confirmBtnRef}
                                            onClick={() => processItem(item)} 
                                            onKeyDown={(e) => handleKeyDown(e, item)}
                                            disabled={!isReady}
                                            className={`px-4 py-1.5 text-xs font-black rounded shadow-md transition-all ${isReady ? 'bg-[#262624] text-[#C2C0B6] hover:bg-[#C2C0B6] hover:text-[#262624] border border-[#44403C]' : 'bg-[#C2C0B6] text-[#262624] cursor-not-allowed opacity-50'}`}
                                        >
                                            {selectedTopic ? 'Add Item' : 'Create Topic'}
                                        </button>
                                        <button onClick={() => setProcessingItem(null)} className="px-4 py-1.5 bg-[#C2C0B6] text-[#262624] border border-[#262624] text-xs font-black rounded hover:bg-[#262624] hover:text-[#C2C0B6]">Cancel</button>
                                    </div>
                                ) : (
                                    <button onClick={() => { setSelectedInboxId(item.id); setProcessingItem(item); }} className="px-4 py-1.5 bg-[#C2C0B6] text-[#262624] border border-[#262624] text-xs font-black rounded opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 hover:bg-[#262624] hover:text-[#C2C0B6]">Process</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                Shortcuts: <kbd>Ctrl+Shift+J</kbd>/<kbd>Ctrl+Shift+K</kbd> select, <kbd>Ctrl+Shift+Enter</kbd> process selected
            </div>
        </div>
    );
};
