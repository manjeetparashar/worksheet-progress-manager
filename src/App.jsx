import React, { useState, useEffect, useMemo, useCallback, useContext, useRef } from 'react';
import { ToastContext, ToastProvider } from './components/ToastContext';
import { WorksheetContext, ZenModeContext } from './context';
import { SafeStorage } from './utils/storage';
import { historyDecompress, safeJSONParse, generateId } from './utils/helpers';
import { computeEnhancedStats, getNextPendingTarget, buildClassesForView } from './utils/logic';
import { traceCompute } from './utils/perfTrace';
import { useBulkSelection } from './hooks/useBulkSelection';
import { useZenNavigation } from './hooks/useZenNavigation';
import { useFileSystemSync } from './hooks/useFileSystemSync';
import { ShortcutProvider } from './hooks/useShortcuts.jsx';
import { useAppShortcuts } from './hooks/useAppShortcuts';
import { useAppState } from './hooks/useAppState';
import { useSafetyServices } from './hooks/useSafetyServices';
import { useSidebarNavigatorState } from './hooks/useSidebarNavigatorState';
import { useViewContextMemory } from './hooks/useViewContextMemory';
import { useBookmarks } from './hooks/useBookmarks';
import { useCommandActions } from './hooks/useCommandActions';
import { ErrorBoundary } from './components/ErrorBoundary';
import { IconRail } from './components/IconRail';
import { ContextSidebar } from './components/ContextSidebar';
import { WorkspacePane } from './components/WorkspacePane';
import { AppOverlays } from './components/AppOverlays';
import { VIEW_MODES } from './constants';
import { createClassEntity, uncollapsePath, addItemToTopicById, moveItemInTopic, applySidebarMacroToTopics } from './domain/actions';

const AppContent = () => {
    const toast = useContext(ToastContext);
    const [modal, setModal] = useState(null);
    const [viewMode, setViewMode] = useState(() => SafeStorage.getItem('ws_view_mode') || VIEW_MODES.TODAY); 
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [filters, setFilters] = useState(() => { try { return new Set(JSON.parse(SafeStorage.getItem('ws_filters') || '[]')); } catch { return new Set(); } });
    const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
    const [zenMode, setZenMode] = useState(false);
    const [theme, setTheme] = useState(() => SafeStorage.getItem('ws_theme') || 'light');
    const [contextSelection, setContextSelection] = useState({ classId: null, subjectId: null, topicId: null });
    const [keymapMode, setKeymapMode] = useState(() => SafeStorage.getItem('ws_keymap_mode') || 'navigation');
    const [operationJournal, setOperationJournal] = useState([]);
    const [macroPreview, setMacroPreview] = useState(null);
    const [importPreview, setImportPreview] = useState(null);
    const [pendingBulkDelete, setPendingBulkDelete] = useState(null);
    const pendingDeleteTimerRef = useRef(null);
    const { state, setState, history, histIdx, setHistIdx, updateState, applyOperation } = useAppState({ keymapMode, toast });
    const { telemetry, setTelemetry } = useSafetyServices({ state });
    
    const bulkSelection = useBulkSelection();
    useZenNavigation();
    const { bookmarks, setBookmarks, addCurrentBookmark } = useBookmarks({ contextSelection, state, toast });

    // Auto-Sync Hook - MUST be called before early return
    const { connect: connectSync, syncStatus, isConnected, lastSaved } = useFileSystemSync(state);

    useEffect(() => {
        SafeStorage.setItem('ws_keymap_mode', keymapMode);
    }, [keymapMode]);

    useEffect(() => () => {
        if (pendingDeleteTimerRef.current) clearTimeout(pendingDeleteTimerRef.current);
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        SafeStorage.setItem('ws_theme', theme);
    }, [theme]);

    const handleCreateClass = useCallback(() => {
        const newId = generateId();
        applyOperation('Create Class', prev => ({ ...prev, classes: createClassEntity(prev.classes, newId) }), setOperationJournal);
        
        // Ensure visibility: Switch to Active view and clear all filters
        setViewMode(VIEW_MODES.ACTIVE);
        setFilters(new Set());
        setContextSelection({ classId: newId, subjectId: null, topicId: null });
        setSidebarOpenClassId(newId);
        setSidebarOpenSubjectId(null);
        
        setTimeout(() => { 
            const el = document.getElementById(newId); 
            if (el) { 
                el.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
                const edit = el.querySelector('.editable-text-focus'); 
                if (edit) edit.click(); 
            } 
        }, 300);
    }, [applyOperation]);

    const focusPath = useCallback((cId, sId, tId, itemId) => {
        setContextSelection({
            classId: cId || null,
            subjectId: sId || null,
            topicId: tId || null
        });
        setSidebarOpenClassId(cId || null);
        setSidebarOpenSubjectId(sId || null);
        updateState(prev => ({ ...prev, classes: uncollapsePath(prev.classes, cId, sId, tId) }), true);

        setTimeout(() => { 
            const targetId = itemId || tId || sId || cId;
            const el = document.getElementById(targetId); 
            if (el) { 
                el.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
                el.classList.add('highlight'); 
                const focusable = el.querySelector('.editable-text-focus'); 
                if(focusable) focusable.focus(); else el.focus(); 
            } 
        }, 150); 
    }, [updateState]);

    const navigateTo = useCallback((cId, sId, tId, itemId) => { 
        setModal(null);
        setViewMode(VIEW_MODES.ACTIVE);
        focusPath(cId, sId, tId, itemId);
    }, [focusPath]);

    const jumpToNextPending = useCallback(() => {
        if (!state) return;
        const currentItemId = document.activeElement?.closest('[data-item-id]')?.getAttribute('data-item-id');
        const next = getNextPendingTarget(state.classes, currentItemId);
        if (!next) return toast('No pending items!');
        navigateTo(next.classId, next.subjectId, next.topicId, `item-${next.itemId}`);
    }, [state, toast, navigateTo]);

    const stats = useMemo(
        () => traceCompute('app.stats.computeEnhancedStats', () => {
            if (!state) return null;
            return computeEnhancedStats(state.classes);
        }),
        [state?.classes]
    );

    const classesToRender = useMemo(
        () => traceCompute('app.view.buildClassesForView', () => {
            if (!state) return [];
            return buildClassesForView(state.classes, viewMode, filters);
        }),
        [state, viewMode, filters]
    );
    const visibleTopicIds = useMemo(() => classesToRender.flatMap(c => c.subjects.flatMap(s => s.topics.map(t => t.id))), [classesToRender]);
    const isFiltered = useMemo(() => (viewMode !== VIEW_MODES.ACTIVE && viewMode !== VIEW_MODES.ARCHIVED) || filters.size > 0, [viewMode, filters]);

    const {
        sidebarQuery,
        setSidebarQuery,
        sidebarOpenClassId,
        setSidebarOpenClassId,
        sidebarOpenSubjectId,
        setSidebarOpenSubjectId,
        sidebarWidth,
        sidebarSelectedTopicIds,
        setSidebarSelectedTopicIds,
        sidebarSearchRef,
        beginSidebarResize,
        sidebarRows,
        visibleSidebarTopicIds,
        handleSidebarTopicSelection
    } = useSidebarNavigatorState({ classesToRender, viewMode });

    useViewContextMemory({
        viewMode,
        setFilters,
        filters,
        bulkSelection,
        contextSelection,
        setContextSelection,
        sidebarQuery,
        setSidebarQuery,
        sidebarOpenClassId,
        setSidebarOpenClassId,
        sidebarOpenSubjectId,
        setSidebarOpenSubjectId,
        classesToRender
    });

    const addItemToTopic = useCallback((topicId) => {
        const newItemId = generateId();
        updateState(prev => ({ ...prev, classes: addItemToTopicById(prev.classes, topicId, newItemId, new Date().toISOString()) }));
        setTimeout(() => { const el = document.querySelector(`[data-item-id="${newItemId}"] .editable-text-focus`); if(el) el.click(); }, 100);
    }, [updateState]);

    const moveItemInState = useCallback((topicId, itemId, direction) => {
        updateState(prev => ({ ...prev, classes: moveItemInTopic(prev.classes, topicId, itemId, direction) }));
        restoreFocus(itemId, 'item');
    }, [updateState]);

    const runSidebarMacro = useCallback((type) => {
        const targets = Array.from(sidebarSelectedTopicIds);
        if (targets.length === 0) {
            toast('Select at least one topic in sidebar first', 'info');
            return;
        }
        const sample = state.classes
            .flatMap(c => c.subjects.flatMap(s => s.topics))
            .filter(t => targets.includes(t.id))
            .slice(0, 5)
            .map(t => t.title);
        setMacroPreview({ type, targets, count: targets.length, sample });
    }, [sidebarSelectedTopicIds, state, toast]);

    const handleUniversalEscape = useCallback(() => {
        setModal(null);
        setPaletteOpen(false);
        setQuickCaptureOpen(false);
        setShowHelp(false);
    }, []);

    useAppShortcuts({
        handleUniversalEscape,
        setPaletteOpen,
        histIdx,
        setHistIdx,
        setState,
        history,
        historyDecompress,
        operationJournal,
        updateState,
        setOperationJournal,
        toast,
        keymapMode,
        setKeymapMode,
        setZenMode,
        setQuickCaptureOpen,
        jumpToNextPending,
        sidebarSearchRef,
        setViewMode,
        setFilters,
        setModal,
        addCurrentBookmark,
        addItemToTopic,
        moveItemInState,
        VIEW_MODES
    });

    const actions = useCommandActions({
        enabled: paletteOpen,
        state,
        connectSync,
        handleCreateClass,
        navigateTo,
        focusPath,
        keymapMode,
        setKeymapMode,
        toast,
        bookmarks,
        addCurrentBookmark,
        setZenMode,
        setQuickCaptureOpen,
        setViewMode,
        setFilters,
        setModal,
        sidebarSearchRef,
        stats,
        updateState
    });

    const classesForMain = useMemo(
        () => traceCompute('app.view.classesForMain', () => {
            if (viewMode === VIEW_MODES.QUICK_INBOX) return [];
            if (!contextSelection.classId) return classesToRender;
            return classesToRender
                .filter(c => c.id === contextSelection.classId)
                .map(c => ({
                    ...c,
                    subjects: !contextSelection.subjectId
                        ? c.subjects
                        : c.subjects
                            .filter(s => s.id === contextSelection.subjectId)
                            .map(s => ({
                                ...s,
                                topics: contextSelection.topicId ? s.topics.filter(t => t.id === contextSelection.topicId) : s.topics
                            }))
                }));
        }),
        [classesToRender, contextSelection, viewMode]
    );

    const selectedClass = useMemo(
        () => classesToRender.find(c => c.id === contextSelection.classId) || null,
        [classesToRender, contextSelection.classId]
    );
    const selectedSubject = useMemo(
        () => selectedClass?.subjects.find(s => s.id === contextSelection.subjectId) || null,
        [selectedClass, contextSelection.subjectId]
    );
    const selectedTopic = useMemo(
        () => selectedSubject?.topics.find(t => t.id === contextSelection.topicId) || null,
        [selectedSubject, contextSelection.topicId]
    );
    const worksheetContextValue = useMemo(
        () => ({ state, updateState, viewMode, zenMode, keymapMode, readOnly: keymapMode === 'review' }),
        [state, updateState, viewMode, zenMode, keymapMode]
    );

    const restoreFocus = (id, type = 'item') => {
        setTimeout(() => {
            let el = document.getElementById(id) || document.querySelector(`[data-${type}-id="${id}"]`);
            if (!el && type === 'item') el = document.getElementById(`item-${id}`);
            if (el) { const focusable = el.querySelector('.editable-text-focus') || el; focusable.focus({preventScroll: true}); el.classList.add('highlight'); setTimeout(() => el.classList.remove('highlight'), 1500); }
        }, 50);
    };

    // --- RENDER ---
    if(!state) return <div className="h-screen flex items-center justify-center bg-[var(--bg-app)]"><div className="loading-spinner"/></div>;

    const nextTheme = theme === 'light' ? 'dark' : 'light';
    const themeIcon = theme === 'light' ? '☀️' : '🌙';
    const viewModeMeta = [
        { mode: VIEW_MODES.TODAY, label: 'Today', icon: '◉' },
        { mode: VIEW_MODES.ACTIVE, label: 'Active', icon: '▣' },
        { mode: VIEW_MODES.ARCHIVED, label: 'Archived', icon: '◌' },
        { mode: VIEW_MODES.DUE_WEEK, label: 'Due week', icon: '◷' },
        { mode: VIEW_MODES.REFERENCE, label: 'Reference', icon: '◎' },
        { mode: VIEW_MODES.QUICK_INBOX, label: 'Quick inbox', icon: '✦' }
    ];
    const selectedViewLabel = viewModeMeta.find(v => v.mode === viewMode)?.label || 'Today';
    const executeMacroPreview = () => {
        if (!macroPreview) return;
        applyOperation(
            macroPreview.type === 'delete' ? 'Sidebar Macro: Delete Topics' : 'Sidebar Macro: Mark Done',
            prev => ({
                ...prev,
                classes: applySidebarMacroToTopics(prev.classes, macroPreview.targets, macroPreview.type, new Date().toISOString())
            }),
            setOperationJournal
        );
        setSidebarSelectedTopicIds(new Set());
        setMacroPreview(null);
        toast('Macro applied', 'success');
    };

    return (
        <WorksheetContext.Provider value={worksheetContextValue}>
            <ZenModeContext.Provider value={zenMode}>
                <div className="h-screen flex bg-[var(--bg-app)]">
                    {!zenMode && (
                        <>
                            <IconRail
                                theme={theme}
                                setTheme={setTheme}
                                nextTheme={nextTheme}
                                themeIcon={themeIcon}
                                viewModeMeta={viewModeMeta}
                                viewMode={viewMode}
                                setViewMode={setViewMode}
                                handleCreateClass={handleCreateClass}
                                setModal={setModal}
                                setShowHelp={setShowHelp}
                            />
                            <ContextSidebar
                                sidebarWidth={sidebarWidth}
                                selectedViewLabel={selectedViewLabel}
                                viewMode={viewMode}
                                VIEW_MODES={VIEW_MODES}
                                sidebarSearchRef={sidebarSearchRef}
                                sidebarQuery={sidebarQuery}
                                setSidebarQuery={setSidebarQuery}
                                filters={filters}
                                setFilters={setFilters}
                                addCurrentBookmark={addCurrentBookmark}
                                bookmarks={bookmarks}
                                focusPath={focusPath}
                                setBookmarks={setBookmarks}
                                setSidebarSelectedTopicIds={setSidebarSelectedTopicIds}
                                visibleSidebarTopicIds={visibleSidebarTopicIds}
                                runSidebarMacro={runSidebarMacro}
                                sidebarSelectedTopicIds={sidebarSelectedTopicIds}
                                state={state}
                                sidebarRows={sidebarRows}
                                sidebarOpenClassId={sidebarOpenClassId}
                                setSidebarOpenClassId={setSidebarOpenClassId}
                                sidebarOpenSubjectId={sidebarOpenSubjectId}
                                setSidebarOpenSubjectId={setSidebarOpenSubjectId}
                                contextSelection={contextSelection}
                                handleSidebarTopicSelection={handleSidebarTopicSelection}
                                beginSidebarResize={beginSidebarResize}
                            />
                        </>
                    )}
                    <WorkspacePane
                        zenMode={zenMode}
                        selectedViewLabel={selectedViewLabel}
                        keymapMode={keymapMode}
                        selectedClass={selectedClass}
                        selectedSubject={selectedSubject}
                        selectedTopic={selectedTopic}
                        focusPath={focusPath}
                        setContextSelection={setContextSelection}
                        setQuickCaptureOpen={setQuickCaptureOpen}
                        setPaletteOpen={setPaletteOpen}
                        viewMode={viewMode}
                        VIEW_MODES={VIEW_MODES}
                        state={state}
                        updateState={updateState}
                        toast={toast}
                        classesForMain={classesForMain}
                        isFiltered={isFiltered}
                        contextSelection={contextSelection}
                        filters={filters}
                        bulkSelection={bulkSelection}
                        visibleTopicIds={visibleTopicIds}
                    />
                </div>
                <AppOverlays
                    bulkSelection={bulkSelection}
                    pendingDeleteTimerRef={pendingDeleteTimerRef}
                    applyOperation={applyOperation}
                    setOperationJournal={setOperationJournal}
                    setPendingBulkDelete={setPendingBulkDelete}
                    pendingBulkDelete={pendingBulkDelete}
                    updateState={updateState}
                    operationJournal={operationJournal}
                    toast={toast}
                    macroPreview={macroPreview}
                    setMacroPreview={setMacroPreview}
                    executeMacroPreview={executeMacroPreview}
                    modal={modal}
                    setModal={setModal}
                    state={state}
                    stats={stats}
                    navigateTo={navigateTo}
                    isConnected={isConnected}
                    lastSaved={lastSaved}
                    syncStatus={syncStatus}
                    connectSync={connectSync}
                    importPreview={importPreview}
                    setImportPreview={setImportPreview}
                    safeJSONParse={safeJSONParse}
                    telemetry={telemetry}
                    setTelemetry={setTelemetry}
                    quickCaptureOpen={quickCaptureOpen}
                    setQuickCaptureOpen={setQuickCaptureOpen}
                    paletteOpen={paletteOpen}
                    setPaletteOpen={setPaletteOpen}
                    actions={actions}
                    showHelp={showHelp}
                    setShowHelp={setShowHelp}
                />
            </ZenModeContext.Provider>
        </WorksheetContext.Provider>
    );
};

export default function App() {
    return (
        <ErrorBoundary>
            <ShortcutProvider>
                <ToastProvider>
                    <AppContent />
                </ToastProvider>
            </ShortcutProvider>
        </ErrorBoundary>
    );
}
