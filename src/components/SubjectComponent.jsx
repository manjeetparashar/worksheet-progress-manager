import React, { useLayoutEffect, useContext, useRef } from 'react';
import { SortableList } from './SortableList';
import { EditableText } from './EditableText';
import { TopicComponent } from './TopicComponent';
import { generateId } from '../utils/helpers';
import { ZenModeContext } from '../context';

const areSubjectPropsEqual = (prev, next) =>
    prev.subject === next.subject &&
    prev.template === next.template &&
    prev.viewMode === next.viewMode &&
    prev.filters === next.filters &&
    prev.onBulkSelect === next.onBulkSelect &&
    prev.selectedIds === next.selectedIds &&
    prev.visibleTopicIds === next.visibleTopicIds &&
    prev.isFiltered === next.isFiltered &&
    prev.reorderEnabled === next.reorderEnabled;

export const SubjectComponent = React.memo(({ subject, onUpdate, onDelete, template, viewMode, filters, onBulkSelect, selectedIds, visibleTopicIds, isFiltered, reorderEnabled }) => {
    const zenMode = useContext(ZenModeContext);
    const rootRef = useRef(null);
    const prevTopicCountRef = useRef(subject.topics.length);
    
    useLayoutEffect(() => {
        const prevCount = prevTopicCountRef.current;
        prevTopicCountRef.current = subject.topics.length;
        if (subject.topics.length <= prevCount) return;
        if (subject.topics.length > 0) {
            const lastTopic = subject.topics[subject.topics.length - 1];
            if (lastTopic.title === 'New Topic') {
                requestAnimationFrame(() => {
                    const el = rootRef.current?.querySelector(`[data-topic-id="${lastTopic.id}"] .font-bold`);
                    if(el && !el.querySelector('input')) el.click(); 
                });
            }
        }
    }, [subject.topics.length]);

    const completion = subject.topics.flatMap(t=>t.items).length > 0 ? Math.floor((subject.topics.flatMap(t=>t.items).filter(i=>i.checked).length/subject.topics.flatMap(t=>t.items).length)*100) : 0;

    return (
        <div id={subject.id}
             ref={rootRef}
             className="ml-2 mb-4 border-l-2 border-[var(--border-strong)] pl-4" 
             style={{ contentVisibility: 'auto', containIntrinsicSize: '520px' }}
             data-nav-item="true" 
             data-subject-id={subject.id} 
             tabIndex="0"
             role="region"
             aria-label={`Subject: ${subject.name}`}>
            <div className="flex items-center gap-2 mb-2 group">
                {!zenMode && <div className="drag-handle text-[var(--text-muted)]" aria-hidden="true">⠿</div>}
                <button onClick={() => onUpdate({ ...subject, collapsed: !subject.collapsed })} 
                        className={`font-bold w-6 h-6 control-button-base ${subject.collapsed ? '' : 'active'}`}
                        aria-label={subject.collapsed ? 'Expand subject' : 'Collapse subject'}
                        aria-expanded={!subject.collapsed}>
                    {subject.collapsed ? '+' : '-'}
                </button>
                <EditableText value={subject.name} onSave={(v) => onUpdate({ ...subject, name: v })} className="font-bold text-[var(--text-main)] text-sm" />
                {completion > 0 && <span className="text-[10px] text-[var(--text-muted)] bg-[var(--status-zero-bg)] px-1 rounded ml-2" aria-label={`${completion} percent complete`}>{completion}% done</span>}
                {!zenMode && (
                    <button onClick={onDelete} 
                            className="w-6 h-6 flex items-center justify-center text-sm font-bold close-button-base rounded opacity-0 group-hover:opacity-100 ml-2"
                            title={`Delete subject ${subject.name}`}
                            aria-label={`Delete subject ${subject.name}`}>
                        ×
                    </button>
                )}
            </div>
            {!subject.collapsed && (
                <div role="list" aria-label={`Topics in ${subject.name}`}>
                    <SortableList items={subject.topics} disabled={!reorderEnabled || isFiltered} onReorder={(topics) => { if(isFiltered || !reorderEnabled) return; onUpdate({ ...subject, topics }); }} renderItem={topic => (
                        <div role="listitem" key={topic.id}>
                            <TopicComponent topic={topic} onUpdate={(t) => onUpdate({ ...subject, topics: subject.topics.map(x => x.id === topic.id ? t : x) })} onDelete={() => onUpdate({ ...subject, topics: subject.topics.filter(x => x.id !== topic.id) })} template={template} viewMode={viewMode} onBulkSelect={onBulkSelect} isSelected={selectedIds.has(topic.id)} visibleTopics={visibleTopicIds} reorderEnabled={reorderEnabled} />
                        </div>
                    )} />
                </div>
            )}
            {!subject.collapsed && !zenMode && (
                <button onClick={() => onUpdate({ ...subject, topics: [...subject.topics, { id: generateId(), title: 'New Topic', items: template.map(t => ({ id: generateId(), label: t.label, checked: false, createdAt: new Date().toISOString() })), priority: 'Medium', collapsed: false, createdAt: new Date().toISOString() }] })} 
                        className="text-xs px-3 py-1.5 rounded-md btn-high-speed btn-topic ml-2 shadow-sm"
                        aria-label="Add new topic to subject">
                    + New Topic (Ctrl+N)
                </button>
            )}
        </div>
    );
}, areSubjectPropsEqual);
