import { useState } from 'react';

export const useBulkSelection = () => {
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [lastSelectedId, setLastSelectedId] = useState(null);
    const toggleSelection = (id, visibleIds = []) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) { next.delete(id); setLastSelectedId(null); } else { next.add(id); setLastSelectedId(id); }
            return next;
        });
    };
    const handleSelection = (id, visibleIds, isShift) => {
        if (isShift && lastSelectedId && visibleIds.includes(lastSelectedId) && visibleIds.includes(id)) {
            const start = visibleIds.indexOf(lastSelectedId);
            const end = visibleIds.indexOf(id);
            const [lower, upper] = start < end ? [start, end] : [end, start];
            const range = visibleIds.slice(lower, upper + 1);
            setSelectedIds(prev => { const next = new Set(prev); range.forEach(itemId => next.add(itemId)); return next; });
        } else { toggleSelection(id); }
    };
    const clearSelection = () => { setSelectedIds(new Set()); setLastSelectedId(null); };
    return { selectedIds, handleSelection, clearSelection, isSelected: (id) => selectedIds.has(id), hasSelection: () => selectedIds.size > 0, toggleSelection };
};