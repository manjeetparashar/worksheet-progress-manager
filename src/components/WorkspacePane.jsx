import React from 'react';
import { SortableList } from './SortableList';
import { ClassComponent } from './ClassComponent';
import { QuickInboxProcessor } from './QuickInboxProcessor';
import { DEFAULT_TEMPLATE } from '../constants';

export const WorkspacePane = ({
    zenMode,
    selectedViewLabel,
    keymapMode,
    selectedClass,
    selectedSubject,
    selectedTopic,
    focusPath,
    setContextSelection,
    setQuickCaptureOpen,
    setPaletteOpen,
    viewMode,
    VIEW_MODES,
    state,
    updateState,
    toast,
    classesForMain,
    isFiltered,
    contextSelection,
    filters,
    bulkSelection,
    visibleTopicIds
}) => {
    const reorderEnabled = keymapMode === 'editing';
    return (
    <main className="flex-1 min-w-0 overflow-y-auto cp-scroll pb-32">
        <div className={`max-w-6xl mx-auto p-4 ${zenMode ? 'pt-2' : ''}`}>
            {zenMode && (
                <div className="fixed top-2 right-2 z-50 animate-pulse no-print">
                    <span className="text-[10px] font-bold text-[var(--text-accent)] uppercase tracking-widest bg-[var(--bg-class)] border border-[var(--text-accent)] px-2 py-0.5 rounded shadow-lg">
                        Zen Mode Active
                    </span>
                </div>
            )}

            {!zenMode && (
                <header className="flex items-center justify-between mb-4 no-print">
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                        <span>Workspace: {selectedViewLabel}</span>
                        <span>•</span>
                        <span>Mode: {keymapMode}</span>
                        {selectedClass && (
                            <>
                                <span>•</span>
                                <button className="px-1 rounded hover:bg-[var(--bg-subject)]" onClick={() => focusPath(selectedClass.id, null, null)}>{selectedClass.name}</button>
                            </>
                        )}
                        {selectedSubject && (
                            <>
                                <span>•</span>
                                <button className="px-1 rounded hover:bg-[var(--bg-subject)]" onClick={() => focusPath(selectedClass.id, selectedSubject.id, null)}>{selectedSubject.name}</button>
                            </>
                        )}
                        {selectedTopic && (
                            <>
                                <span>•</span>
                                <button className="px-1 rounded hover:bg-[var(--bg-subject)]" onClick={() => focusPath(selectedClass.id, selectedSubject.id, selectedTopic.id)}>{selectedTopic.title}</button>
                            </>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {(selectedClass || selectedSubject || selectedTopic) && (
                            <button onClick={() => setContextSelection({ classId: null, subjectId: null, topicId: null })} className="text-sm px-4 py-1.5 rounded-lg btn-high-speed btn-manage">Show All</button>
                        )}
                        <button onClick={() => setQuickCaptureOpen(true)} className="text-sm px-4 py-1.5 rounded-lg shadow-sm btn-high-speed btn-create">Quick Capture</button>
                        <button onClick={() => setPaletteOpen(true)} className="text-sm px-4 py-1.5 rounded-lg btn-high-speed btn-nav">Command</button>
                    </div>
                </header>
            )}

            {viewMode === VIEW_MODES.QUICK_INBOX ? (
                <div className="bg-[var(--bg-class)] p-6 rounded-lg border border-[var(--border-strong)] shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[var(--text-main)]">Inbox Processing</h2>
                        <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-app)] px-2 py-1 rounded">
                            {state.quickInbox?.length || 0} items pending
                        </span>
                    </div>
                    <QuickInboxProcessor
                        inboxItems={state.quickInbox || []}
                        classes={state.classes}
                        onUpdateState={updateState}
                        onToast={toast}
                    />
                    {(state.quickInbox?.length || 0) === 0 && (
                        <div className="text-center py-12 text-[var(--text-muted)]">
                            <div className="text-4xl mb-4">✨</div>
                            <p>Inbox is clear. Capture something with <kbd className="bg-[var(--bg-subject)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">Ctrl+Shift+A</kbd></p>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <SortableList items={classesForMain} disabled={!reorderEnabled || isFiltered || viewMode !== VIEW_MODES.ACTIVE || !!contextSelection.classId} onReorder={n => updateState(prev => ({ ...prev, classes: [...n, ...prev.classes.filter(c => c.archived)] }))} renderItem={cls => (
                        <ClassComponent key={cls.id} cls={cls} onUpdate={u => updateState({ ...state, classes: state.classes.map(c => c.id === cls.id ? u : c) })} onDelete={() => updateState({ ...state, classes: state.classes.filter(c => c.id !== cls.id) })} template={state.template || DEFAULT_TEMPLATE} viewMode={viewMode} filters={filters} onBulkSelect={bulkSelection} visibleTopicIds={visibleTopicIds} isFiltered={isFiltered} reorderEnabled={reorderEnabled} />
                    )} />
                    {classesForMain.length === 0 && <div className="text-center py-20 text-[var(--text-muted)]">🧘 No items in this view.</div>}
                </>
            )}
        </div>
    </main>
    );
};
