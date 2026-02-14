import React, { useState, useRef, useEffect } from 'react';

export const EditableText = ({ value, onSave, className, onKeyDown, onEditingChange }) => {
    const [editing, setEditing] = useState(false);
    const [txt, setTxt] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => { setTxt(value); }, [value]);
    useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

    const handleSave = () => {
        setEditing(false);
        if (onEditingChange) onEditingChange(false);
        if (txt !== value) onSave(txt);
    };

    if (editing) {
        return (
            <input
                ref={inputRef}
                value={txt}
                onChange={e => setTxt(e.target.value)}
                onBlur={handleSave}
                onKeyDown={e => {
                    if (e.key === 'Enter') { e.stopPropagation(); handleSave(); }
                    if (e.key === 'Escape') { e.stopPropagation(); setTxt(value); setEditing(false); if(onEditingChange) onEditingChange(false); }
                    if (onKeyDown) onKeyDown(e);
                }}
                className={`border border-[var(--text-accent)] rounded px-1 outline-none focus:ring-2 focus:ring-[var(--selection-bg)] ${className} min-w-[50px] bg-[var(--bg-class)]`}
            />
        );
    }

    return (
        <span
            onClick={() => { setEditing(true); if(onEditingChange) onEditingChange(true); }}
            className={`cursor-text hover:bg-[var(--bg-subject)] rounded px-1 transition-colors editable-text-focus ${className}`}
            tabIndex="0"
            onKeyDown={e => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setEditing(true); if(onEditingChange) onEditingChange(true); } }}
        >
            {value || <span className="opacity-50 italic">Empty</span>}
        </span>
    );
};