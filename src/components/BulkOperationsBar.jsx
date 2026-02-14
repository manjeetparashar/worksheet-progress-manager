import React from 'react';

export const BulkOperationsBar = ({ selectedCount, onClear, onMarkDone, onDeleteSelected }) => {
    if (selectedCount === 0) return null;
    return ( <div className="fixed bottom-4 left-4 right-4 z-[80] bg-[var(--text-main)] text-[var(--bg-app)] p-3 rounded-lg shadow-lg flex justify-between items-center animate-slide-up border border-[var(--border-subtle)]"> <div className="font-bold pl-2">{selectedCount} topics selected</div> <div className="flex gap-2"> <button onClick={onMarkDone} className="px-4 py-1.5 rounded text-sm btn-high-speed btn-nav">Mark Complete</button> <button onClick={onDeleteSelected} className="px-4 py-1.5 rounded text-sm btn-high-speed btn-danger">Delete</button> <button onClick={onClear} className="px-4 py-1.5 rounded text-sm btn-high-speed btn-manage">Cancel</button> </div> </div> );
};