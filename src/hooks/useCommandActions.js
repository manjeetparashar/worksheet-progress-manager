import { useMemo } from 'react';
import { syncAllTopicsToTemplate } from '../utils/logic';
import { VIEW_MODES } from '../constants';
import { traceCompute } from '../utils/perfTrace';

export const useCommandActions = ({
    enabled,
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
}) => useMemo(() => traceCompute('command.actions.build', () => {
    const macroActions = [
        { label: '🧭 Macro: Today Overdue Sweep', sub: 'Alt+Shift+1', action: () => { setViewMode(VIEW_MODES.TODAY); setFilters(new Set(['Overdue'])); } },
        { label: '📝 Macro: Capture + Inbox', sub: 'Alt+Shift+2', action: () => { setViewMode(VIEW_MODES.QUICK_INBOX); setQuickCaptureOpen(true); } },
        { label: '📆 Macro: Weekly Planning', sub: 'Alt+Shift+3', action: () => { setViewMode(VIEW_MODES.DUE_WEEK); setModal('analytics'); } }
    ];
    const viewActions = [
        { label: 'View: Today', sub: 'Alt+1', action: () => setViewMode(VIEW_MODES.TODAY) },
        { label: 'View: Active', sub: 'Alt+2', action: () => setViewMode(VIEW_MODES.ACTIVE) },
        { label: 'View: Archived', sub: 'Alt+3', action: () => setViewMode(VIEW_MODES.ARCHIVED) },
        { label: 'View: Due week', sub: 'Alt+4', action: () => setViewMode(VIEW_MODES.DUE_WEEK) },
        { label: 'View: Reference', sub: 'Alt+5', action: () => setViewMode(VIEW_MODES.REFERENCE) },
        { label: 'View: Quick inbox', sub: 'Alt+6', action: () => setViewMode(VIEW_MODES.QUICK_INBOX) },
        { label: 'Focus: Sidebar Filter', sub: 'Ctrl+Shift+F', action: () => sidebarSearchRef.current?.focus() },
        { label: 'System: Cycle Keymap Mode', sub: 'Ctrl+Shift+M', action: () => {
            const modes = ['navigation', 'editing', 'review'];
            const idx = modes.indexOf(keymapMode);
            const next = modes[(idx + 1) % modes.length];
            setKeymapMode(next);
            toast(`Keymap mode: ${next}`, 'info');
        } }
    ];

    const bookmarkActions = bookmarks.map(b => ({
        label: `🔖 ${b.label}`,
        sub: b.path || 'Bookmark',
        action: () => focusPath(b.classId, b.subjectId, b.topicId)
    }));
    const baseActions = [
        { label: '✨ Toggle Zen Mode', sub: 'Alt+Z', action: () => setZenMode(p => !p) },
        { label: '⚡ Quick Capture', sub: 'Ctrl+Shift+A', action: () => setQuickCaptureOpen(true) },
        { label: '🔖 Add Current Bookmark', sub: 'Alt+B', action: addCurrentBookmark },
        { label: '💾 Connect Local File', sub: 'File System Sync', action: connectSync },
        { label: '📂 Create New Class', sub: 'Structure', action: handleCreateClass },
        { label: '🔄 Batch Template Sync', sub: 'System Maintenance', action: () => {
            if(confirm('Add missing checklist items from global template to ALL topics?')) {
                const { newClasses, updateCount } = syncAllTopicsToTemplate(state.classes, state.template);
                updateState(prev => ({ ...prev, classes: newClasses }));
                toast(`Successfully synced ${updateCount} topics to template`, 'success');
            }
        }},
        { label: '👻 Archive All Zombies', sub: 'System Maintenance', action: () => {
            if (!stats?.zombieTopics?.length) return toast('No zombies found!', 'info');
            if(confirm(`Archive all ${stats.zombieTopics.length} zombie topics?`)) {
                const ids = stats.zombieTopics.map(t => t.id);
                updateState(prev => ({
                    ...prev,
                    classes: prev.classes.map(c => ({...c, subjects: c.subjects.map(s => ({...s, topics: s.topics.filter(t => !ids.includes(t.id))}))}))
                }));
                toast(`Archived ${ids.length} zombies`, 'success');
            }
        }},
        { label: '🔍 Run System Diagnostics', sub: 'Health Check', action: () => setModal('analytics') },
    ];
    
    if (!enabled || !state) return [...viewActions, ...macroActions, ...baseActions, ...bookmarkActions];

    const dynamicActions = state.classes.flatMap(c =>
        c.subjects.flatMap(s =>
            s.topics.flatMap(t => {
                const classAction = {
                    label: c.name,
                    sub: 'Class',
                    action: () => focusPath(c.id, null, null)
                };
                const subjectAction = {
                    label: s.name,
                    sub: `Subject in ${c.name}`,
                    action: () => focusPath(c.id, s.id, null)
                };
                const topicAction = {
                    label: t.title,
                    sub: `Topic in ${c.name} > ${s.name}`,
                    action: () => navigateTo(c.id, s.id, t.id)
                };
                const itemActions = t.items.map(i => ({
                    label: i.label,
                    sub: `Task in ${t.title} (${s.name})`,
                    action: () => navigateTo(c.id, s.id, t.id, `item-${i.id}`)
                }));
                return [classAction, subjectAction, topicAction, ...itemActions];
            })
        )
    );
    return [...viewActions, ...macroActions, ...baseActions, ...bookmarkActions, ...dynamicActions];
}), [
    enabled,
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
]);
