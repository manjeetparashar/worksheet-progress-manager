import React, { useLayoutEffect, useContext, useRef } from 'react';
import { SortableList } from './SortableList';
import { EditableText } from './EditableText';
import { SubjectComponent } from './SubjectComponent';
import { generateId } from '../utils/helpers';
import { ZenModeContext } from '../context';

const areClassPropsEqual = (prev, next) =>
    prev.cls === next.cls &&
    prev.template === next.template &&
    prev.viewMode === next.viewMode &&
    prev.filters === next.filters &&
    prev.onBulkSelect === next.onBulkSelect &&
    prev.visibleTopicIds === next.visibleTopicIds &&
    prev.isFiltered === next.isFiltered &&
    prev.reorderEnabled === next.reorderEnabled;

export const ClassComponent = React.memo(({ cls, onUpdate, onDelete, template, viewMode, filters, onBulkSelect, visibleTopicIds, isFiltered, reorderEnabled }) => {
    const zenMode = useContext(ZenModeContext);
    const rootRef = useRef(null);
    const prevSubjectCountRef = useRef(cls.subjects.length);
    
    useLayoutEffect(() => {
        if (cls.name === 'New Class' && cls.subjects.length === 0) {
            requestAnimationFrame(() => {
                const el = rootRef.current?.querySelector('.text-xl');
                if(el && !el.querySelector('input')) el.click();
            });
        }
    }, [cls.name, cls.subjects.length]);

    useLayoutEffect(() => {
        const prevCount = prevSubjectCountRef.current;
        prevSubjectCountRef.current = cls.subjects.length;
        if (cls.subjects.length <= prevCount) return;
        if (cls.subjects.length > 0) {
            const lastSubject = cls.subjects[cls.subjects.length - 1];
            if (lastSubject.name === 'New Subject') {
                requestAnimationFrame(() => {
                    const el = rootRef.current?.querySelector(`[data-subject-id="${lastSubject.id}"] .font-bold`);
                    if(el && !el.querySelector('input')) el.click();
                });
            }
        }
    }, [cls.subjects.length]);

    const toggleCollapse = () => onUpdate({ ...cls, collapsed: !cls.collapsed });

    return (
        <div id={cls.id}
             ref={rootRef}
             className="class-container mb-8 bg-[var(--bg-class)] backdrop-blur-md border border-[var(--border-subtle)] rounded-lg shadow-sm p-4" 
             style={{ contentVisibility: 'auto', containIntrinsicSize: '900px' }}
             data-class-id={cls.id} 
             tabIndex="0"
             role="region"
             aria-label={`Class: ${cls.name}`}>
            
            <div className="flex justify-between items-center mb-4 border-b border-[var(--border-subtle)] pb-2 cursor-pointer group/header gap-6"
                 onClick={toggleCollapse}>
                
                <div className="flex items-center gap-3 flex-1">
                    {!zenMode && (
                        <div className="drag-handle text-[var(--text-muted)] hover:text-[var(--text-main)]" 
                             onClick={(e) => e.stopPropagation()} 
                             aria-hidden="true">⠿</div>
                    )}
                    
                    <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 control-button-base transition-transform duration-200 ${cls.collapsed ? '' : 'rotate-90 active'}`}>
                            ▶
                        </span>
                        <div onClick={(e) => e.stopPropagation()}>
                            <EditableText value={cls.name} onSave={(v) => onUpdate({ ...cls, name: v })} className="text-xl font-bold text-[var(--text-main)]" />
                        </div>
                    </div>
                    
                    <div className="flex-1" /> {/* SMART SPACER: Pushes metadata to the right */}
                    
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] bg-[var(--bg-app)] border border-[var(--border-subtle)] px-2 py-0.5 rounded shadow-sm opacity-60 group-hover/header:opacity-100 transition-opacity">
                        {cls.subjects.length} {cls.subjects.length === 1 ? 'subject' : 'subjects'}
                    </span>
                </div>

                {!zenMode && (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={onDelete} 
                                className="w-8 h-8 flex items-center justify-center text-lg font-bold close-button-base rounded-full"
                                title={`Delete class ${cls.name}`}
                                aria-label={`Delete class ${cls.name}`}>
                            ×
                        </button>
                    </div>
                )}
            </div>

            {!cls.collapsed && (
                <div role="list" aria-label={`Subjects in ${cls.name}`}>
                    <SortableList items={cls.subjects} disabled={!reorderEnabled || isFiltered} onReorder={(subjects) => { if(isFiltered || !reorderEnabled) return; onUpdate({ ...cls, subjects }); }} renderItem={subject => (
                        <div role="listitem" key={subject.id}>
                            <SubjectComponent subject={subject} onUpdate={(s) => onUpdate({ ...cls, subjects: cls.subjects.map(x => x.id === subject.id ? s : x) })} onDelete={() => onUpdate({ ...cls, subjects: cls.subjects.filter(x => x.id !== subject.id) })} template={template} viewMode={viewMode} filters={filters} onBulkSelect={onBulkSelect} selectedIds={onBulkSelect.selectedIds} visibleTopicIds={visibleTopicIds} isFiltered={isFiltered} reorderEnabled={reorderEnabled} />
                        </div>
                    )} />
                </div>
            )}
            
            {!cls.collapsed && !zenMode && (
                <button onClick={() => onUpdate({ ...cls, subjects: [...cls.subjects, { id: generateId(), name: 'New Subject', topics: [], collapsed: false }] })} 
                        className="w-full mt-2 py-3 border-2 border-dashed rounded-lg text-sm btn-high-speed btn-subject shadow-sm"
                        aria-label="Add new subject to class">
                    + ADD SUBJECT
                </button>
            )}
        </div>
    );
}, areClassPropsEqual);
