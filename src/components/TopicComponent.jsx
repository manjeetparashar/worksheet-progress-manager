import React, { useState, useLayoutEffect, useContext, useRef } from 'react';
import { calculateProgress } from '../utils/logic';
import { generateId } from '../utils/helpers';
import { EditableText } from './EditableText';
import { MarkdownEditor } from './MarkdownEditor';
import { SmartDateInput } from './SmartDateInput';
import { SortableList } from './SortableList';
import { ZenModeContext } from '../context';

const areTopicPropsEqual = (prev, next) =>
    prev.topic === next.topic &&
    prev.template === next.template &&
    prev.viewMode === next.viewMode &&
    prev.onBulkSelect === next.onBulkSelect &&
    prev.isSelected === next.isSelected &&
    prev.visibleTopics === next.visibleTopics &&
    prev.reorderEnabled === next.reorderEnabled;

export const TopicComponent = React.memo(({ topic, onUpdate, onDelete, template, viewMode, onBulkSelect, isSelected, visibleTopics, reorderEnabled }) => {
    const zenMode = useContext(ZenModeContext);
    const rootRef = useRef(null);
    const prevItemCountRef = useRef(topic.items.length);
    
    useLayoutEffect(() => {
        const prevCount = prevItemCountRef.current;
        prevItemCountRef.current = topic.items.length;
        if (topic.items.length <= prevCount) return;
        if (topic.items.length > 0) {
            const lastItem = topic.items[topic.items.length - 1];
            if (lastItem.label === 'New Item' && !lastItem.checked) {
                 requestAnimationFrame(() => {
                    const el = rootRef.current?.querySelector(`[data-item-id="${lastItem.id}"] .editable-text-focus`);
                    if(el) el.click();
                 });
            }
        }
    }, [topic.items.length]);

    const handleCheck = (itemId) => {
        const updated = topic.items.map(i => i.id === itemId ? { ...i, checked: !i.checked, checkedAt: !i.checked ? new Date().toISOString() : null } : i);
        onUpdate({ ...topic, items: updated });
    };
    
    const handleItemKeyDown = (e, itemId) => {
        if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
        const row = e.target.closest('[data-item-id]');
        if (!row) return;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextRow = row.nextElementSibling;
            if (nextRow) {
                const nextFocus = nextRow.querySelector('.editable-text-focus'); 
                if (nextFocus) nextFocus.focus();
            } else {
                const addItemBtn = row.closest('.p-3').querySelector('button.text-xs');
                if(addItemBtn) addItemBtn.focus();
            }
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevRow = row.previousElementSibling;
            if (prevRow) {
                const prevFocus = prevRow.querySelector('.editable-text-focus');
                if (prevFocus) prevFocus.focus();
            }
        }
        
        if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            handleCheck(itemId);
        }

        if (e.key === 'Delete' && e.shiftKey) {
            e.preventDefault();
            if(confirm('Delete this item?')) {
                onUpdate({ ...topic, items: topic.items.filter(i => i.id !== itemId) });
            }
        }
    };

    const handleTopicKeyDown = (e) => {
        if (e.target !== e.currentTarget && !e.target.classList.contains('editable-text-focus')) return;
        if (e.code === 'Space' && !editingTitle) {
            e.preventDefault();
            onBulkSelect.handleSelection(topic.id, visibleTopics, e.shiftKey);
        }
    };

    const [editingTitle, setEditingTitle] = useState(false);

    const { done, total, percent } = calculateProgress(topic.items);
    return (
        <div id={topic.id}
             ref={rootRef}
             className={`border rounded-lg mb-4 bg-[var(--bg-topic)] backdrop-blur-md shadow-sm transition-all ${topic.priority === 'High' ? 'border-l-4 border-l-[var(--text-danger)]' : 'border-[var(--border-subtle)]'} ${isSelected ? 'ring-2 ring-[var(--border-focus)] bg-[var(--selection-bg)]' : ''}`} 
             style={{ contentVisibility: 'auto', containIntrinsicSize: '420px' }}
             data-topic-focusable="true" 
             data-topic-id={topic.id} 
             tabIndex="0"
             role="region"
             aria-label={`Topic: ${topic.title}`}>
            <div className={`flex items-center p-3 gap-2 bg-[var(--bg-topic-hover)] rounded-t-lg border-b border-[var(--border-subtle)] ${isSelected ? 'bg-[var(--selection-bg)]' : ''}`} onClick={(e) => { if(e.shiftKey) onBulkSelect.handleSelection(topic.id, visibleTopics, true); }}>
                {!zenMode && <div className="drag-handle text-[var(--text-muted)]" aria-hidden="true">⠿</div>}
                <input type="checkbox" 
                       checked={isSelected} 
                       onChange={(e) => {e.stopPropagation(); onBulkSelect.handleSelection(topic.id, visibleTopics, e.nativeEvent.shiftKey)}} 
                       className="mr-2"
                       aria-label={`Select topic ${topic.title}`} />
                <button onClick={(e) => {e.stopPropagation(); onUpdate({ ...topic, collapsed: !topic.collapsed })}} 
                        className={`text-sm font-bold w-6 h-6 control-button-base ${topic.collapsed ? '' : 'active'}`}
                        aria-label={topic.collapsed ? 'Expand topic' : 'Collapse topic'}
                        aria-expanded={!topic.collapsed}>
                    {topic.collapsed ? '▸' : '▾'}
                </button>
                <EditableText value={topic.title} onSave={(v) => onUpdate({ ...topic, title: v })} onEditingChange={setEditingTitle} className="font-bold flex-1 text-sm text-[var(--text-main)]" />
                <span className={`progress-pill ${percent === 100 ? 'pill-done' : percent >= 50 ? 'pill-mid' : percent > 0 ? 'pill-low' : 'pill-zero'}`}
                      aria-label={`${percent} percent complete`}>
                    {percent}%
                </span>
                <SmartDateInput value={topic.dueDate} onChange={(v) => onUpdate({ ...topic, dueDate: v })} className="w-20 text-xs border border-[var(--border-subtle)] rounded px-1 text-center bg-[var(--bg-topic)] text-[var(--text-main)]" aria-label="Due date" />
                {!zenMode && (
                    <button onClick={onDelete} 
                            className="w-6 h-6 flex items-center justify-center text-sm font-bold close-button-base rounded-full"
                            title={`Delete topic ${topic.title}`}
                            aria-label={`Delete topic ${topic.title}`}>
                        ×
                    </button>
                )}
            </div>
            {!topic.collapsed && (
                <div className="p-3">
                    <div className="mb-3 flex gap-2">
                        <MarkdownEditor 
                            value={topic.notes} 
                            onChange={(e) => onUpdate({ ...topic, notes: e.target.value })} 
                            placeholder="Notes..." 
                            onCtrlEnter={() => onUpdate({...topic, items: [...topic.items, {id: generateId(), label: 'New Item', checked: false, createdAt: new Date().toISOString()}]})}
                            className="text-[var(--text-main)] placeholder-[var(--text-muted)]"
                            aria-label="Notes"
                        />
                        <select value={topic.priority} 
                                onChange={(e) => onUpdate({ ...topic, priority: e.target.value })} 
                                className="text-xs border border-[var(--border-subtle)] rounded px-1 h-[34px] bg-[var(--bg-topic)] text-[var(--text-main)]"
                                aria-label="Priority">
                            <option value="Low">Low</option> <option value="Medium">Med</option> <option value="High">High</option> 
                        </select>
                    </div>
                    <div role="list" aria-label={`Tasks in ${topic.title}`}>
                        <SortableList items={topic.items} disabled={!reorderEnabled} onReorder={(items) => onUpdate({ ...topic, items })} renderItem={(item, idx) => (
                            <div key={item.id} id={`item-${item.id}`} className="flex items-start gap-2 py-1 group" data-item-id={item.id} role="listitem">
                                {!zenMode && <div className="drag-handle text-[var(--text-muted)] mt-1 cursor-move" aria-hidden="true">⠿</div>}
                                <input type="checkbox" 
                                       checked={item.checked} 
                                       onChange={() => handleCheck(item.id)} 
                                       className="mt-1"
                                       aria-label={`Mark ${item.label} as complete`} />
                                <div className="flex-1" tabIndex="-1">
                                    <EditableText 
                                        value={item.label} 
                                        onSave={(v) => onUpdate({ ...topic, items: topic.items.map(i => i.id === item.id ? { ...i, label: v } : i) })} 
                                        className={`w-full block text-sm ${item.checked ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-main)]'}`}
                                        onKeyDown={(e) => handleItemKeyDown(e, item.id)} 
                                    />
                                </div>
                                {!zenMode && (
                                    <button onClick={() => onUpdate({ ...topic, items: topic.items.filter(i => i.id !== item.id) })} 
                                            className="w-5 h-5 flex items-center justify-center text-sm font-bold close-button-base rounded opacity-0 group-hover:opacity-100"
                                            title={`Delete task ${item.label}`}
                                            aria-label={`Delete task ${item.label}`}>
                                        ×
                                    </button>
                                )}
                            </div>
                        )} />
                    </div>
                    {!zenMode && (
                        <button onClick={() => onUpdate({...topic, items: [...topic.items, {id: generateId(), label: 'New Item', checked: false, createdAt: new Date().toISOString()}]})} 
                                className="text-xs px-3 py-1.5 rounded-md btn-high-speed btn-item mt-2 shadow-sm focus:outline-none"
                                aria-label="Add new task">
                            + Add Item (Ctrl+Enter)
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}, areTopicPropsEqual);
