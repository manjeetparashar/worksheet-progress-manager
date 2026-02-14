import { useRegisterShortcut } from './useShortcuts.jsx';
import { APP_SHORTCUTS } from '../config/shortcuts';

export const useAppShortcuts = ({
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
}) => {
    useRegisterShortcut(APP_SHORTCUTS.CLOSE_OVERLAYS.combo, handleUniversalEscape, APP_SHORTCUTS.CLOSE_OVERLAYS.description, APP_SHORTCUTS.CLOSE_OVERLAYS.category, APP_SHORTCUTS.CLOSE_OVERLAYS.id);
    useRegisterShortcut(APP_SHORTCUTS.OPEN_PALETTE_CTRL.combo, () => setPaletteOpen(true), APP_SHORTCUTS.OPEN_PALETTE_CTRL.description, APP_SHORTCUTS.OPEN_PALETTE_CTRL.category, APP_SHORTCUTS.OPEN_PALETTE_CTRL.id);
    useRegisterShortcut(APP_SHORTCUTS.OPEN_PALETTE_SLASH.combo, () => setPaletteOpen(true), APP_SHORTCUTS.OPEN_PALETTE_SLASH.description, APP_SHORTCUTS.OPEN_PALETTE_SLASH.category, APP_SHORTCUTS.OPEN_PALETTE_SLASH.id);
    useRegisterShortcut(APP_SHORTCUTS.UNDO.combo, () => {
        if (histIdx > 0) {
            const i = histIdx - 1;
            setHistIdx(i);
            setState(historyDecompress(history[i]));
        }
    }, APP_SHORTCUTS.UNDO.description, APP_SHORTCUTS.UNDO.category, APP_SHORTCUTS.UNDO.id);
    useRegisterShortcut(APP_SHORTCUTS.REDO.combo, () => {
        if (histIdx < history.length - 1) {
            const i = histIdx + 1;
            setHistIdx(i);
            setState(historyDecompress(history[i]));
        }
    }, APP_SHORTCUTS.REDO.description, APP_SHORTCUTS.REDO.category, APP_SHORTCUTS.REDO.id);
    useRegisterShortcut(APP_SHORTCUTS.ROLLBACK_LAST.combo, () => {
        const latest = operationJournal[0];
        if (!latest) return;
        const rollbackState = historyDecompress(latest.snapshot);
        updateState(rollbackState, false, true);
        setOperationJournal(j => j.slice(1));
        toast(`Rolled back: ${latest.label}`, 'success');
    }, APP_SHORTCUTS.ROLLBACK_LAST.description, APP_SHORTCUTS.ROLLBACK_LAST.category, APP_SHORTCUTS.ROLLBACK_LAST.id);
    useRegisterShortcut(APP_SHORTCUTS.CYCLE_KEYMAP_MODE.combo, () => {
        const modes = ['navigation', 'editing', 'review'];
        const idx = modes.indexOf(keymapMode);
        const next = modes[(idx + 1) % modes.length];
        setKeymapMode(next);
        toast(`Keymap mode: ${next}`, 'info');
    }, APP_SHORTCUTS.CYCLE_KEYMAP_MODE.description, APP_SHORTCUTS.CYCLE_KEYMAP_MODE.category, APP_SHORTCUTS.CYCLE_KEYMAP_MODE.id);
    useRegisterShortcut(APP_SHORTCUTS.TOGGLE_ZEN.combo, () => setZenMode(p => !p), APP_SHORTCUTS.TOGGLE_ZEN.description, APP_SHORTCUTS.TOGGLE_ZEN.category, APP_SHORTCUTS.TOGGLE_ZEN.id);
    useRegisterShortcut(APP_SHORTCUTS.QUICK_CAPTURE.combo, () => setQuickCaptureOpen(true), APP_SHORTCUTS.QUICK_CAPTURE.description, APP_SHORTCUTS.QUICK_CAPTURE.category, APP_SHORTCUTS.QUICK_CAPTURE.id);
    useRegisterShortcut(APP_SHORTCUTS.JUMP_NEXT_PENDING.combo, () => { if (keymapMode !== 'review') jumpToNextPending(); }, APP_SHORTCUTS.JUMP_NEXT_PENDING.description, APP_SHORTCUTS.JUMP_NEXT_PENDING.category, APP_SHORTCUTS.JUMP_NEXT_PENDING.id);
    useRegisterShortcut(APP_SHORTCUTS.FOCUS_SIDEBAR_FILTER.combo, () => sidebarSearchRef.current?.focus(), APP_SHORTCUTS.FOCUS_SIDEBAR_FILTER.description, APP_SHORTCUTS.FOCUS_SIDEBAR_FILTER.category, APP_SHORTCUTS.FOCUS_SIDEBAR_FILTER.id);
    useRegisterShortcut(APP_SHORTCUTS.VIEW_TODAY.combo, () => setViewMode(VIEW_MODES.TODAY), APP_SHORTCUTS.VIEW_TODAY.description, APP_SHORTCUTS.VIEW_TODAY.category, APP_SHORTCUTS.VIEW_TODAY.id);
    useRegisterShortcut(APP_SHORTCUTS.VIEW_ACTIVE.combo, () => setViewMode(VIEW_MODES.ACTIVE), APP_SHORTCUTS.VIEW_ACTIVE.description, APP_SHORTCUTS.VIEW_ACTIVE.category, APP_SHORTCUTS.VIEW_ACTIVE.id);
    useRegisterShortcut(APP_SHORTCUTS.VIEW_ARCHIVED.combo, () => setViewMode(VIEW_MODES.ARCHIVED), APP_SHORTCUTS.VIEW_ARCHIVED.description, APP_SHORTCUTS.VIEW_ARCHIVED.category, APP_SHORTCUTS.VIEW_ARCHIVED.id);
    useRegisterShortcut(APP_SHORTCUTS.VIEW_DUE_WEEK.combo, () => setViewMode(VIEW_MODES.DUE_WEEK), APP_SHORTCUTS.VIEW_DUE_WEEK.description, APP_SHORTCUTS.VIEW_DUE_WEEK.category, APP_SHORTCUTS.VIEW_DUE_WEEK.id);
    useRegisterShortcut(APP_SHORTCUTS.VIEW_REFERENCE.combo, () => setViewMode(VIEW_MODES.REFERENCE), APP_SHORTCUTS.VIEW_REFERENCE.description, APP_SHORTCUTS.VIEW_REFERENCE.category, APP_SHORTCUTS.VIEW_REFERENCE.id);
    useRegisterShortcut(APP_SHORTCUTS.VIEW_QUICK_INBOX.combo, () => setViewMode(VIEW_MODES.QUICK_INBOX), APP_SHORTCUTS.VIEW_QUICK_INBOX.description, APP_SHORTCUTS.VIEW_QUICK_INBOX.category, APP_SHORTCUTS.VIEW_QUICK_INBOX.id);
    useRegisterShortcut(APP_SHORTCUTS.MACRO_OVERDUE_SWEEP.combo, () => { setViewMode(VIEW_MODES.TODAY); setFilters(new Set(['Overdue'])); }, APP_SHORTCUTS.MACRO_OVERDUE_SWEEP.description, APP_SHORTCUTS.MACRO_OVERDUE_SWEEP.category, APP_SHORTCUTS.MACRO_OVERDUE_SWEEP.id);
    useRegisterShortcut(APP_SHORTCUTS.MACRO_CAPTURE_INBOX.combo, () => { setViewMode(VIEW_MODES.QUICK_INBOX); setQuickCaptureOpen(true); }, APP_SHORTCUTS.MACRO_CAPTURE_INBOX.description, APP_SHORTCUTS.MACRO_CAPTURE_INBOX.category, APP_SHORTCUTS.MACRO_CAPTURE_INBOX.id);
    useRegisterShortcut(APP_SHORTCUTS.MACRO_WEEKLY_PLANNING.combo, () => { setViewMode(VIEW_MODES.DUE_WEEK); setModal('analytics'); }, APP_SHORTCUTS.MACRO_WEEKLY_PLANNING.description, APP_SHORTCUTS.MACRO_WEEKLY_PLANNING.category, APP_SHORTCUTS.MACRO_WEEKLY_PLANNING.id);
    useRegisterShortcut(APP_SHORTCUTS.ADD_BOOKMARK.combo, addCurrentBookmark, APP_SHORTCUTS.ADD_BOOKMARK.description, APP_SHORTCUTS.ADD_BOOKMARK.category, APP_SHORTCUTS.ADD_BOOKMARK.id);
    useRegisterShortcut(APP_SHORTCUTS.ADD_ITEM_TO_TOPIC.combo, () => {
        const topicEl = document.activeElement.closest('[data-topic-id]');
        if (topicEl) addItemToTopic(topicEl.getAttribute('data-topic-id'));
    }, APP_SHORTCUTS.ADD_ITEM_TO_TOPIC.description, APP_SHORTCUTS.ADD_ITEM_TO_TOPIC.category, APP_SHORTCUTS.ADD_ITEM_TO_TOPIC.id);
    useRegisterShortcut(APP_SHORTCUTS.MOVE_ITEM_UP.combo, () => {
        const itemEl = document.activeElement.closest('[data-item-id]');
        const topicEl = document.activeElement.closest('[data-topic-id]');
        if (itemEl && topicEl) moveItemInState(topicEl.getAttribute('data-topic-id'), itemEl.getAttribute('data-item-id'), -1);
    }, APP_SHORTCUTS.MOVE_ITEM_UP.description, APP_SHORTCUTS.MOVE_ITEM_UP.category, APP_SHORTCUTS.MOVE_ITEM_UP.id);
    useRegisterShortcut(APP_SHORTCUTS.MOVE_ITEM_DOWN.combo, () => {
        const itemEl = document.activeElement.closest('[data-item-id]');
        const topicEl = document.activeElement.closest('[data-topic-id]');
        if (itemEl && topicEl) moveItemInState(topicEl.getAttribute('data-topic-id'), itemEl.getAttribute('data-item-id'), 1);
    }, APP_SHORTCUTS.MOVE_ITEM_DOWN.description, APP_SHORTCUTS.MOVE_ITEM_DOWN.category, APP_SHORTCUTS.MOVE_ITEM_DOWN.id);
};
