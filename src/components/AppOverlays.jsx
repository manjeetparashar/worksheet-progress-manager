import React from 'react';
import { Modal } from './Modal';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ArchiveManager } from './ArchiveManager';
import { TemplateEditor } from './TemplateEditor';
import { QuickCapture } from './QuickCapture';
import { CommandPalette } from './CommandPalette';
import { KeyboardHelp } from './KeyboardHelp';
import { BulkOperationsBar } from './BulkOperationsBar';
import { DataExportService, DataImportService } from '../utils/data';
import { historyDecompress, generateId } from '../utils/helpers';
import { DEFAULT_TEMPLATE } from '../constants';
import { deleteTopicsByIds, markTopicsDoneByIds } from '../domain/actions';

export const AppOverlays = ({
    bulkSelection,
    pendingDeleteTimerRef,
    applyOperation,
    setOperationJournal,
    setPendingBulkDelete,
    pendingBulkDelete,
    updateState,
    operationJournal,
    toast,
    macroPreview,
    setMacroPreview,
    executeMacroPreview,
    modal,
    setModal,
    state,
    stats,
    navigateTo,
    isConnected,
    lastSaved,
    syncStatus,
    connectSync,
    importPreview,
    setImportPreview,
    safeJSONParse,
    telemetry,
    setTelemetry,
    quickCaptureOpen,
    setQuickCaptureOpen,
    paletteOpen,
    setPaletteOpen,
    actions,
    showHelp,
    setShowHelp
}) => (
    <>
        <BulkOperationsBar selectedCount={bulkSelection.selectedIds.size} onClear={bulkSelection.clearSelection} onDeleteSelected={() => {
                if (!confirm('Delete selected topics? They can be restored within 10 seconds.')) return;
                if (pendingDeleteTimerRef.current) clearTimeout(pendingDeleteTimerRef.current);
                applyOperation('Bulk Delete Topics', prev => {
                    const previousClasses = prev.classes;
                    const nextClasses = deleteTopicsByIds(prev.classes, bulkSelection.selectedIds);
                    const deletedCount = previousClasses.reduce((sum, c) => sum + c.subjects.reduce((sSum, s) => sSum + s.topics.filter(t => bulkSelection.isSelected(t.id)).length, 0), 0);
                    setPendingBulkDelete({ previousClasses, deletedCount });
                    pendingDeleteTimerRef.current = setTimeout(() => {
                        setPendingBulkDelete(null);
                        pendingDeleteTimerRef.current = null;
                    }, 10000);
                    return { ...prev, classes: nextClasses };
                }, setOperationJournal);
                bulkSelection.clearSelection();
            }} onMarkDone={() => {
                applyOperation('Bulk Mark Done', p => ({ ...p, classes: markTopicsDoneByIds(p.classes, bulkSelection.selectedIds, new Date().toISOString()) }), setOperationJournal);
                bulkSelection.clearSelection();
            }} />

        {pendingBulkDelete && (
            <div className="fixed bottom-20 left-4 right-4 z-[85] bg-[var(--status-mid-bg)] border border-[var(--status-mid-text)] rounded-lg p-3 flex items-center justify-between no-print">
                <span className="text-xs font-bold text-[var(--status-mid-text)]">
                    {pendingBulkDelete.deletedCount} topics deleted. Undo available for 10s.
                </span>
                <button
                    onClick={() => {
                        updateState(prev => ({ ...prev, classes: pendingBulkDelete.previousClasses }));
                        setPendingBulkDelete(null);
                        if (pendingDeleteTimerRef.current) {
                            clearTimeout(pendingDeleteTimerRef.current);
                            pendingDeleteTimerRef.current = null;
                        }
                    }}
                    className="px-3 py-1 rounded text-xs btn-high-speed btn-manage"
                >
                    Undo Delete
                </button>
            </div>
        )}

        {operationJournal.length > 0 && (
            <div className="fixed bottom-4 left-4 z-[84] bg-[var(--bg-class)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 flex items-center gap-3 no-print shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                    Last op: {operationJournal[0].label}
                </span>
                <button
                    onClick={() => {
                        const latest = operationJournal[0];
                        if (!latest) return;
                        const rollbackState = historyDecompress(latest.snapshot);
                        updateState(rollbackState, false, true);
                        setOperationJournal(j => j.slice(1));
                        toast(`Rolled back: ${latest.label}`, 'success');
                    }}
                    className="px-3 py-1 rounded text-[10px] btn-high-speed btn-manage"
                >
                    Rollback
                </button>
            </div>
        )}

        <Modal isOpen={!!macroPreview} onClose={() => setMacroPreview(null)} title="Macro Diff Preview">
            {macroPreview && (
                <div className="space-y-3 text-xs">
                    <div className="text-[var(--text-main)]">Action: <span className="font-bold">{macroPreview.type === 'delete' ? 'Delete Topics' : 'Mark Topics Done'}</span></div>
                    <div className="text-[var(--text-muted)]">Targets: {macroPreview.count} topics</div>
                    <div className="border border-[var(--border-subtle)] rounded p-2 max-h-40 overflow-y-auto cp-scroll">
                        {macroPreview.sample.map((name, idx) => <div key={idx} className="py-0.5">{name}</div>)}
                        {macroPreview.count > macroPreview.sample.length && <div className="py-0.5 text-[var(--text-muted)]">...and {macroPreview.count - macroPreview.sample.length} more</div>}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={executeMacroPreview} className="px-3 py-1 rounded btn-high-speed btn-danger text-xs">Confirm</button>
                        <button onClick={() => setMacroPreview(null)} className="px-3 py-1 rounded btn-high-speed btn-manage text-xs">Cancel</button>
                    </div>
                </div>
            )}
        </Modal>

        <Modal isOpen={modal==='analytics'} onClose={()=>setModal(null)} title="Analytics & Health" wide={true}>
            <AnalyticsDashboard state={state} stats={stats} onNavigate={navigateTo} onUpdateState={updateState} onToast={toast} />
        </Modal>

        <Modal isOpen={modal==='export'} onClose={()=>setModal(null)} title="Data & Maintenance">
            <div className="grid grid-cols-1 gap-2">
                <div className={`p-3 border rounded text-left flex justify-between items-center ${isConnected ? 'bg-[var(--status-done-bg)] border-[var(--status-done-text)]' : 'bg-[var(--bg-class)] border-[var(--border-subtle)]'}`}>
                    <div>
                        <div className="font-bold text-sm text-[var(--text-main)]">Local File Sync</div>
                        <div className={`text-xs ${isConnected ? 'text-[var(--status-done-text)]' : 'text-[var(--text-muted)]'}`}>
                            {isConnected ? `Synced • Last saved: ${lastSaved ? lastSaved.toLocaleTimeString() : 'Just now'}` : 'Connect to a local file for auto-saving'}
                        </div>
                    </div>
                    {isConnected ? (
                        <span className={`text-xs font-bold px-2 py-1 rounded ${syncStatus === 'saving' ? 'bg-[var(--status-low-bg)] text-[var(--status-low-text)]' : 'bg-[var(--status-done-bg)] text-[var(--status-done-text)]'}`}>
                            {syncStatus === 'saving' ? 'Saving...' : 'Active'}
                        </span>
                    ) : (
                        <button onClick={connectSync} className="px-3 py-1 rounded btn-high-speed btn-data text-xs">Connect</button>
                    )}
                </div>
                <button onClick={()=>{const b=new Blob([DataExportService.toCSV(state)],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`ws-${new Date().toISOString().split('T')[0]}.csv`;a.click();}} className="p-3 rounded-lg text-left btn-high-speed btn-data text-sm shadow-sm">Download CSV</button>
                <button onClick={()=>{const b=new Blob([JSON.stringify(state)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`ws-backup.json`;a.click();}} className="p-3 rounded-lg text-left btn-high-speed btn-data text-sm shadow-sm">Download JSON Backup</button>
                <div className="p-3 bg-[var(--bg-class)] border border-[var(--border-subtle)] rounded-lg">
                    <div className="text-[10px] font-black uppercase mb-2 tracking-widest text-[var(--text-muted)]">Import Data (JSON or CSV)</div>
                    <input type="file" className="text-sm w-full file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black btn-high-speed btn-data cursor-pointer" accept=".json,.csv" onChange={e=>{ 
                        const f=e.target.files[0]; if(!f)return; 
                        const r=new FileReader(); 
                        r.onload=evt=>{ 
                            let d = f.name.endsWith('.csv') ? DataImportService.fromCSV(evt.target.result) : safeJSONParse(evt.target.result); 
                            if(d && DataImportService.validate(JSON.stringify(d))) { 
                                const report = DataImportService.compatibilityReport(d);
                                setImportPreview({ fileName: f.name, data: d, report });
                            } else alert('Invalid File Format'); 
                        }; 
                        r.readAsText(f); 
                    }}/>
                </div>
                {importPreview && (
                    <div className="p-3 bg-[var(--bg-class)] border border-[var(--border-focus)] rounded-lg space-y-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Compatibility Dry Run: {importPreview.fileName}</div>
                        <div className="text-xs text-[var(--text-main)]">
                            Classes: {importPreview.report.classes} • Subjects: {importPreview.report.subjects} • Topics: {importPreview.report.topics} • Items: {importPreview.report.items}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                            Source version: {importPreview.report.sourceVersion} • Target version: {importPreview.report.targetVersion}
                        </div>
                        {importPreview.report.warnings.length > 0 && (
                            <ul className="text-[10px] text-[var(--status-low-text)] list-disc pl-4">
                                {importPreview.report.warnings.map((w, idx) => <li key={idx}>{w}</li>)}
                            </ul>
                        )}
                        <div className="flex gap-2">
                            <button onClick={() => {
                                applyOperation('Import Data', () => DataImportService.migrateData(importPreview.data), setOperationJournal);
                                setImportPreview(null);
                                setModal(null);
                                toast('Import Successful!', 'success');
                            }} className="px-3 py-1 rounded btn-high-speed btn-data text-xs">Apply Import</button>
                            <button onClick={() => setImportPreview(null)} className="px-3 py-1 rounded btn-high-speed btn-manage text-xs">Cancel</button>
                        </div>
                    </div>
                )}
                <button onClick={()=>setModal('analytics')} className="p-3 rounded-lg text-left btn-high-speed btn-manage text-sm shadow-sm">Run System Diagnostics</button>
                <button onClick={()=>setModal('telemetry')} className="p-3 rounded-lg text-left btn-high-speed btn-manage text-sm shadow-sm">Performance Telemetry</button>
                <button onClick={()=>setModal('template')} className="p-3 rounded-lg text-left btn-high-speed btn-manage text-sm shadow-sm">Edit Global Checklist Template</button>
                <button onClick={()=>setModal('archive')} className="p-3 rounded-lg text-left btn-high-speed btn-manage text-sm shadow-sm">Manage Archived Classes</button>
            </div>
        </Modal>

        <Modal isOpen={modal==='archive'} onClose={()=>setModal('export')} title="Archived Classes">
            <ArchiveManager classes={state.classes} onUpdate={c => updateState({...state, classes: c})} />
        </Modal>

        <Modal isOpen={modal==='template'} onClose={()=>setModal('export')} title="Global Checklist Template">
            <div className="space-y-3">
                <p className="text-xs text-[var(--text-muted)]">
                    Changes here affect defaults for new topics and future batch template sync.
                </p>
                <TemplateEditor
                    template={state.template || DEFAULT_TEMPLATE}
                    onUpdate={(template) => updateState(prev => ({ ...prev, template }))}
                />
            </div>
        </Modal>

        <Modal isOpen={modal==='telemetry'} onClose={()=>setModal('export')} title="Performance Telemetry">
            <div className="space-y-2">
                <div className="text-xs text-[var(--text-muted)]">Cold start, hydration, and first-input latency history.</div>
                <div className="max-h-[50vh] overflow-y-auto cp-scroll border border-[var(--border-subtle)] rounded">
                    {telemetry.length === 0 ? (
                        <div className="p-3 text-xs text-[var(--text-muted)]">No telemetry recorded yet.</div>
                    ) : telemetry.map(entry => (
                        <div key={entry.id} className="p-2 border-b border-[var(--border-subtle)] text-xs flex justify-between">
                            <span>{new Date(entry.ts).toLocaleString()}</span>
                            <span>Hydration: {entry.hydrationMs ?? '-'} ms</span>
                            <span>First input: {entry.firstInputMs ?? '-'} ms</span>
                        </div>
                    ))}
                </div>
                <button onClick={() => setTelemetry([])} className="px-3 py-1 rounded btn-high-speed btn-manage text-xs">Clear History</button>
            </div>
        </Modal>

        <QuickCapture isOpen={quickCaptureOpen} onClose={() => setQuickCaptureOpen(false)} onAddToInbox={text => applyOperation('Quick Capture to Inbox', p => ({...p, quickInbox: [...(p.quickInbox||[]), {text, createdAt: new Date().toISOString(), id: generateId()}]}), setOperationJournal)} />
        <CommandPalette isOpen={paletteOpen} onClose={()=>setPaletteOpen(false)} actions={actions} />
        <KeyboardHelp isOpen={showHelp} onClose={()=>setShowHelp(false)} />
    </>
);
