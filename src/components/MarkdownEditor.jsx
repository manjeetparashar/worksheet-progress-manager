import React, { useState, useRef, useEffect, useMemo } from 'react';
import snarkdown from 'snarkdown';
import DOMPurify from 'dompurify';

export const MarkdownEditor = ({ value, onChange, placeholder, onCtrlEnter, className }) => {
    const [isEditing, setIsEditing] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            // Move cursor to end
            textareaRef.current.selectionStart = textareaRef.current.value.length;
            textareaRef.current.selectionEnd = textareaRef.current.value.length;
        }
    }, [isEditing]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            if (onCtrlEnter) onCtrlEnter();
        }
        if (e.key === 'Escape') {
            setIsEditing(false);
        }
    };

    const renderedHtml = useMemo(() => {
        if (!value) return '';
        return DOMPurify.sanitize(snarkdown(value));
    }, [value]);

    return (
        <div className={`relative flex-1 ${className}`}>
            {isEditing ? (
                <textarea
                    ref={textareaRef}
                    value={value || ''}
                    onChange={onChange}
                    onBlur={() => setIsEditing(false)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full p-2 text-sm bg-[var(--bg-app)] border border-[var(--border-focus)] rounded-md outline-none focus:ring-2 focus:ring-[var(--selection-bg)] resize-none min-h-[34px] leading-snug cp-scroll text-[var(--text-main)]"
                    rows={Math.max(2, (value || '').split('\n').length)}
                />
            ) : (
                <div 
                    onClick={() => setIsEditing(true)}
                    className={`w-full p-2 text-sm min-h-[34px] cursor-text rounded-md hover:bg-[var(--bg-topic-hover)] transition-colors prose prose-sm max-w-none prose-p:my-0 prose-ul:my-0 prose-li:my-0 prose-a:text-[var(--text-accent)] text-[var(--text-main)] ${!value ? 'italic text-[var(--text-muted)]' : ''}`}
                    dangerouslySetInnerHTML={{ __html: value ? renderedHtml : placeholder }}
                />
            )}
        </div>
    );
};
