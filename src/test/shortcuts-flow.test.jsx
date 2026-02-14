import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React, { useRef } from 'react';
import { ShortcutProvider } from '../hooks/useShortcuts.jsx';
import { useAppShortcuts } from '../hooks/useAppShortcuts';
import { VIEW_MODES } from '../constants';

const ShortcutsHarness = (props) => {
    const sidebarSearchRef = useRef(null);
    useAppShortcuts({
        handleUniversalEscape: props.handleUniversalEscape,
        setPaletteOpen: props.setPaletteOpen,
        histIdx: 0,
        setHistIdx: vi.fn(),
        setState: vi.fn(),
        history: [JSON.stringify({})],
        historyDecompress: (x) => x,
        operationJournal: [],
        updateState: vi.fn(),
        setOperationJournal: vi.fn(),
        toast: props.toast,
        keymapMode: 'navigation',
        setKeymapMode: props.setKeymapMode,
        setZenMode: vi.fn(),
        setQuickCaptureOpen: props.setQuickCaptureOpen,
        jumpToNextPending: vi.fn(),
        sidebarSearchRef,
        setViewMode: props.setViewMode,
        setFilters: props.setFilters,
        setModal: props.setModal,
        addCurrentBookmark: vi.fn(),
        addItemToTopic: vi.fn(),
        moveItemInState: vi.fn(),
        VIEW_MODES
    });
    return <input ref={sidebarSearchRef} aria-label="sidebar-filter" />;
};

describe('App shortcuts flow', () => {
    let setPaletteOpen;
    let setViewMode;
    let setKeymapMode;
    let setQuickCaptureOpen;
    let setFilters;
    let setModal;
    let toast;
    let handleUniversalEscape;

    beforeEach(() => {
        setPaletteOpen = vi.fn();
        setViewMode = vi.fn();
        setKeymapMode = vi.fn();
        setQuickCaptureOpen = vi.fn();
        setFilters = vi.fn();
        setModal = vi.fn();
        toast = vi.fn();
        handleUniversalEscape = vi.fn();
    });

    it('opens command palette with Ctrl+K', () => {
        render(
            <ShortcutProvider>
                <ShortcutsHarness
                    setPaletteOpen={setPaletteOpen}
                    setViewMode={setViewMode}
                    setKeymapMode={setKeymapMode}
                    setQuickCaptureOpen={setQuickCaptureOpen}
                    setFilters={setFilters}
                    setModal={setModal}
                    toast={toast}
                    handleUniversalEscape={handleUniversalEscape}
                />
            </ShortcutProvider>
        );

        fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
        expect(setPaletteOpen).toHaveBeenCalledWith(true);
    });

    it('switches to Active view with Alt+2', () => {
        render(
            <ShortcutProvider>
                <ShortcutsHarness
                    setPaletteOpen={setPaletteOpen}
                    setViewMode={setViewMode}
                    setKeymapMode={setKeymapMode}
                    setQuickCaptureOpen={setQuickCaptureOpen}
                    setFilters={setFilters}
                    setModal={setModal}
                    toast={toast}
                    handleUniversalEscape={handleUniversalEscape}
                />
            </ShortcutProvider>
        );

        fireEvent.keyDown(window, { key: '2', altKey: true });
        expect(setViewMode).toHaveBeenCalledWith(VIEW_MODES.ACTIVE);
    });

    it('cycles keymap mode and shows feedback with Ctrl+Shift+M', () => {
        render(
            <ShortcutProvider>
                <ShortcutsHarness
                    setPaletteOpen={setPaletteOpen}
                    setViewMode={setViewMode}
                    setKeymapMode={setKeymapMode}
                    setQuickCaptureOpen={setQuickCaptureOpen}
                    setFilters={setFilters}
                    setModal={setModal}
                    toast={toast}
                    handleUniversalEscape={handleUniversalEscape}
                />
            </ShortcutProvider>
        );

        fireEvent.keyDown(window, { key: 'm', ctrlKey: true, shiftKey: true });
        expect(setKeymapMode).toHaveBeenCalledWith('editing');
        expect(toast).toHaveBeenCalledWith('Keymap mode: editing', 'info');
    });
});
