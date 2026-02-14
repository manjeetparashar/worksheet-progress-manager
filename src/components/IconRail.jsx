import React from 'react';

export const IconRail = ({
    theme,
    setTheme,
    nextTheme,
    themeIcon,
    viewModeMeta,
    viewMode,
    setViewMode,
    handleCreateClass,
    setModal,
    setShowHelp
}) => (
    <aside className="w-20 border-r border-[var(--border-subtle)] bg-[var(--bg-class)] p-2 flex flex-col items-center gap-2 no-print">
        <button onClick={() => setTheme(nextTheme)} title={`Current: ${theme} - Click to switch`} className="text-xl p-1 hover:bg-[var(--bg-subject)] rounded-md transition-colors grayscale hover:grayscale-0 border border-transparent hover:border-[var(--border-subtle)]">
            {themeIcon}
        </button>
        <div className="flex-1 w-full flex flex-col gap-1 mt-2">
            {viewModeMeta.map(({ mode, label, icon }) => (
                <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    title={label}
                    className={`w-full py-2 rounded-md flex flex-col items-center justify-center btn-high-speed btn-nav ${viewMode === mode ? 'active shadow-inner' : ''}`}
                >
                    <span className="text-xs">{icon}</span>
                    <span className="text-[9px] uppercase tracking-widest">{label}</span>
                </button>
            ))}
        </div>
        <div className="w-full flex flex-col gap-1">
            <button onClick={handleCreateClass} title="Create Class" className="w-full py-2 rounded-md btn-high-speed btn-create text-[10px] uppercase tracking-widest">+ Class</button>
            <button onClick={() => setModal('analytics')} title="Analytics" className="w-full py-2 rounded-md btn-high-speed btn-manage text-[10px] uppercase tracking-widest">Analytics</button>
            <button onClick={() => setModal('export')} title="Data" className="w-full py-2 rounded-md btn-high-speed btn-data text-[10px] uppercase tracking-widest">Data</button>
            <button onClick={() => setShowHelp(true)} title="Keyboard Shortcuts (Ctrl+/)" className="w-full py-2 rounded-md btn-high-speed btn-help text-[10px] uppercase tracking-widest">Help</button>
        </div>
    </aside>
);
