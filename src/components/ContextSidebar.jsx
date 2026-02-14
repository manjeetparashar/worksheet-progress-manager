import React from 'react';
import { VirtualScrollList } from './VirtualScrollList';
import { calculateProgress } from '../utils/logic';

export const ContextSidebar = ({
    sidebarWidth,
    selectedViewLabel,
    viewMode,
    VIEW_MODES,
    sidebarSearchRef,
    sidebarQuery,
    setSidebarQuery,
    filters,
    setFilters,
    addCurrentBookmark,
    bookmarks,
    focusPath,
    setBookmarks,
    setSidebarSelectedTopicIds,
    visibleSidebarTopicIds,
    runSidebarMacro,
    sidebarSelectedTopicIds,
    state,
    sidebarRows,
    sidebarOpenClassId,
    setSidebarOpenClassId,
    sidebarOpenSubjectId,
    setSidebarOpenSubjectId,
    contextSelection,
    handleSidebarTopicSelection,
    beginSidebarResize
}) => (
    <>
        <aside style={{ width: `${sidebarWidth}px` }} className="border-r border-[var(--border-subtle)] bg-[var(--bg-subject)] p-3 flex flex-col gap-3 no-print overflow-hidden">
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] px-1">
                {selectedViewLabel} Navigator
            </div>
            {viewMode !== VIEW_MODES.QUICK_INBOX && (
                <>
                    <input
                        ref={sidebarSearchRef}
                        type="text"
                        value={sidebarQuery}
                        onChange={(e) => setSidebarQuery(e.target.value)}
                        placeholder="Filter class/subject/topic"
                        className="w-full text-xs"
                    />
                    <div className="grid grid-cols-2 gap-1">
                        {['Overdue', 'Stalled', 'High Priority', 'Notes'].map(f => (
                            <button key={f} onClick={() => setFilters(p => { const n = new Set(); if (!p.has(f)) n.add(f); return n; })} className={`px-2 py-1 rounded text-[10px] transition-all btn-high-speed btn-filter ${filters.has(f) ? 'active shadow-inner' : ''}`}>
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider px-1">
                        Alt+1..6 switch views • Ctrl+Shift+F focus filter
                    </div>
                    <div className="flex gap-1">
                        <button onClick={addCurrentBookmark} className="px-2 py-1 rounded text-[10px] btn-high-speed btn-nav">Add Bookmark</button>
                    </div>
                    {bookmarks.length > 0 && (
                        <div className="space-y-1">
                            {bookmarks.slice(0, 5).map(b => (
                                <div key={b.id} className="flex items-center gap-1">
                                    <button onClick={() => focusPath(b.classId, b.subjectId, b.topicId)} className="flex-1 text-left text-[10px] px-2 py-1 rounded bg-[var(--bg-class)] border border-[var(--border-subtle)] hover:border-[var(--border-focus)] truncate">
                                        {b.label}
                                    </button>
                                    <button onClick={() => setBookmarks(prev => prev.filter(x => x.id !== b.id))} className="w-5 h-5 rounded close-button-base text-[10px]">×</button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-1">
                        <button onClick={() => setSidebarSelectedTopicIds(new Set(visibleSidebarTopicIds))} className="px-2 py-1 rounded text-[10px] btn-high-speed btn-filter">Select Filtered</button>
                        <button onClick={() => runSidebarMacro('mark_done')} className="px-2 py-1 rounded text-[10px] btn-high-speed btn-manage">Mark Done</button>
                        <button onClick={() => runSidebarMacro('delete')} className="px-2 py-1 rounded text-[10px] btn-high-speed btn-danger">Delete</button>
                    </div>
                    {sidebarSelectedTopicIds.size > 0 && (
                        <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider px-1">
                            {sidebarSelectedTopicIds.size} topics selected
                        </div>
                    )}
                </>
            )}
            <div className="flex-1 overflow-y-auto cp-scroll space-y-2 pr-1">
                {viewMode === VIEW_MODES.QUICK_INBOX ? (
                    <>
                        {(state.quickInbox || []).map(item => (
                            <div key={item.id} className="p-2 rounded border border-[var(--border-subtle)] bg-[var(--bg-class)]">
                                <div className="text-xs font-bold text-[var(--text-main)] truncate">{item.text}</div>
                                <div className="text-[10px] text-[var(--text-muted)] mt-1">{new Date(item.createdAt).toLocaleString()}</div>
                            </div>
                        ))}
                        {(state.quickInbox?.length || 0) === 0 && <div className="text-xs text-[var(--text-muted)] p-2">Inbox is empty.</div>}
                    </>
                ) : (
                    <VirtualScrollList
                        items={sidebarRows}
                        itemHeight={34}
                        className="h-full"
                        renderItem={(row) => {
                            if (row.type === 'class') {
                                return (
                                    <div key={row.id} className="rounded border border-[var(--border-subtle)] bg-[var(--bg-class)] p-1.5 mb-1">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    const isOpen = sidebarOpenClassId === row.cls.id;
                                                    setSidebarOpenClassId(isOpen ? null : row.cls.id);
                                                    if (isOpen) setSidebarOpenSubjectId(null);
                                                }}
                                                className="w-5 h-5 rounded control-button-base text-[10px]"
                                            >
                                                {sidebarOpenClassId === row.cls.id || sidebarQuery.trim() ? '-' : '+'}
                                            </button>
                                            <button onClick={() => focusPath(row.cls.id, null, null)} className={`flex-1 text-left text-xs font-bold px-1 rounded ${contextSelection.classId === row.cls.id && !contextSelection.subjectId ? 'bg-[var(--selection-bg)]' : ''}`}>{row.cls.name}</button>
                                            <span className="text-[9px] text-[var(--text-muted)]">{row.cls.subjects.length}</span>
                                        </div>
                                    </div>
                                );
                            }
                            if (row.type === 'subject') {
                                return (
                                    <div key={row.id} className="ml-4 rounded border border-[var(--border-subtle)] bg-[var(--bg-class)] p-1 mb-1">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    const isOpen = sidebarOpenSubjectId === row.subj.id;
                                                    setSidebarOpenSubjectId(isOpen ? null : row.subj.id);
                                                }}
                                                className="w-4 h-4 rounded control-button-base text-[9px]"
                                            >
                                                {sidebarOpenSubjectId === row.subj.id || sidebarQuery.trim() ? '-' : '+'}
                                            </button>
                                            <button onClick={() => focusPath(row.cls.id, row.subj.id, null)} className={`flex-1 text-left text-[11px] px-1 rounded ${contextSelection.subjectId === row.subj.id && !contextSelection.topicId ? 'bg-[var(--selection-bg)]' : ''}`}>{row.subj.name}</button>
                                            <span className="text-[9px] text-[var(--text-muted)]">{row.subj.topics.length}</span>
                                        </div>
                                    </div>
                                );
                            }
                            const progress = calculateProgress(row.topic.items);
                            return (
                                <div key={row.id} className={`w-full ml-8 mb-1 text-left text-[10px] px-1.5 py-1 rounded border border-transparent hover:border-[var(--border-subtle)] bg-[var(--bg-class)] ${contextSelection.topicId === row.topic.id ? 'bg-[var(--selection-bg)] border-[var(--border-focus)]' : ''}`}>
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="checkbox"
                                            checked={sidebarSelectedTopicIds.has(row.topic.id)}
                                            onChange={(e) => handleSidebarTopicSelection(row.topic.id, e.nativeEvent.shiftKey)}
                                            className="w-3.5 h-3.5"
                                        />
                                        <button
                                            onClick={(e) => {
                                                if (e.shiftKey) handleSidebarTopicSelection(row.topic.id, true);
                                                else focusPath(row.cls.id, row.subj.id, row.topic.id);
                                            }}
                                            className="flex-1 text-left"
                                        >
                                            <div className="truncate text-[var(--text-main)]">{row.topic.title}</div>
                                            <div className="text-[9px] text-[var(--text-muted)]">{progress.percent}%</div>
                                        </button>
                                    </div>
                                </div>
                            );
                        }}
                    />
                )}
            </div>
        </aside>
        <div
            onMouseDown={beginSidebarResize}
            className="w-1 cursor-col-resize bg-[var(--border-subtle)] hover:bg-[var(--text-accent)] transition-colors no-print"
            title="Drag to resize sidebar"
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize contextual sidebar"
        />
    </>
);
