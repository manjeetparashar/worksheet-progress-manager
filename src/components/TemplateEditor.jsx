import React from 'react';
import { SortableList } from './SortableList';
import { generateId } from '../utils/helpers';

export const TemplateEditor = ({ template, onUpdate }) => {
    return ( <div className="space-y-3"> <SortableList items={template} onReorder={items => onUpdate(items)} renderItem={item => ( <div key={item.id} className="flex items-center gap-2 p-2 bg-white border rounded mb-2 shadow-sm"> <div className="drag-handle text-slate-400">⠿</div> <input className="flex-1 border-none outline-none text-sm font-medium" value={item.label} onChange={e => { const n = template.map(t => t.id === item.id ? { ...t, label: e.target.value } : t); onUpdate(n); }} /> <button onClick={() => onUpdate(template.filter(t => t.id !== item.id))} className="w-6 h-6 flex items-center justify-center close-button-base rounded-full text-lg">&times;</button> </div> )} /> <button onClick={() => onUpdate([...template, { id: generateId(), label: 'New Action' }])} className="w-full py-2 bg-slate-100 text-slate-600 rounded text-sm font-bold hover:bg-slate-200">+ Add Template Item</button> </div> );
};