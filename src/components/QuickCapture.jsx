import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export const QuickCapture = ({ isOpen, onClose, onAddToInbox }) => {
    const [text, setText] = useState('');

    useEffect(() => {
        if (isOpen) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
            window.addEventListener('keydown', handleEsc);
            return () => {
                document.body.style.overflow = originalStyle;
                window.removeEventListener('keydown', handleEsc);
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) { onAddToInbox(text); setText(''); if (e.nativeEvent.submitter?.dataset.close) onClose(); }
    };

    const content = (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
             onClick={onClose}>
            <form onSubmit={handleSubmit} 
                  onClick={e => e.stopPropagation()}
                  className="bg-[#ffffff80] backdrop-blur-xl border border-[var(--border-strong)] rounded-2xl shadow-2xl p-6 w-full max-w-xl my-auto">
                <div className="mb-4 flex justify-between items-center">
                    <h3 className="font-extrabold text-[var(--text-main)] text-lg uppercase tracking-tight">Quick Capture</h3>
                    <span className="text-[10px] font-black bg-[#262624] text-[#C2C0B6] px-2 py-1 rounded border border-[#44403C]">Esc to close</span>
                </div>
                <textarea autoFocus 
                          value={text} 
                          onChange={e => setText(e.target.value)} 
                          placeholder="What's on your mind?..." 
                          className="w-full h-40 p-4 bg-[#ffffff60] text-[var(--text-main)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--border-focus)] transition-all font-medium text-lg resize-none shadow-inner" />
                <div className="flex justify-between items-center mt-6">
                    <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-black bg-[#C2C0B6] text-[#262624] rounded-lg hover:bg-[#262624] hover:text-[#C2C0B6] border border-[#262624] transition-all shadow-sm">Discard</button>
                    <div className="flex gap-3">
                        <button type="submit" className="px-5 py-2 bg-[#C2C0B6] text-[#262624] text-sm font-black rounded-lg hover:bg-[#262624] hover:text-[#C2C0B6] border border-[#262624] transition-all shadow-sm">Add</button>
                        <button type="submit" data-close="true" className="px-6 py-2 bg-[#262624] text-[#C2C0B6] text-sm font-black rounded-lg shadow-lg hover:bg-[#C2C0B6] hover:text-[#262624] transition-all border border-[#44403C]">Add & Close</button>
                    </div>
                </div>
            </form>
        </div>
    );

    return createPortal(content, document.body);
};