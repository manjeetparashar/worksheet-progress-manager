import React from 'react';

export const ArchiveManager = ({ classes, onUpdate }) => {
    const archived = classes.filter(c => c.archived);
    return ( <div className="space-y-6"> <div> <h4 className="font-bold mb-2">Archived Classes ({archived.length})</h4> {archived.length === 0 ? <p className="text-sm text-[var(--text-muted)] italic">No archived classes.</p> : archived.map(c => ( <div key={c.id} className="flex justify-between items-center p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-class)] rounded-lg mb-2"> <span className="font-bold text-[var(--text-main)]">{c.name}</span> <div className="flex gap-2"> <button onClick={() => onUpdate(classes.map(x => x.id === c.id ? { ...x, archived: false } : x))} className="px-3 py-1 rounded text-xs btn-high-speed btn-nav">Restore</button> <button onClick={() => onUpdate(classes.filter(x => x.id !== c.id))} className="px-3 py-1 rounded text-xs btn-high-speed btn-danger">Delete Forever</button> </div> </div> ))} </div> </div> );
};