import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export const Modal=({isOpen,onClose,title,children,wide,tiny})=>{
    const modalRef = useRef(null);

    useEffect(() => { 
        const h=e=>{if(isOpen&&e.key==='Escape'){e.stopPropagation();onClose()}}; 
        window.addEventListener('keydown',h); 
        return ()=>window.removeEventListener('keydown',h); 
    }, [isOpen,onClose]);
    
    useEffect(() => {
        if (isOpen) {
            // Shift focus and scroll to top of modal immediately
            setTimeout(() => {
                if (modalRef.current) {
                    modalRef.current.focus();
                    window.scrollTo(0, 0); // Reset background scroll position for safety
                }
            }, 50);
        }
    }, [isOpen]);

    if(!isOpen) return null;
    
    const content = (
        <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99999,
                backgroundColor: 'rgba(0,0,0,0.7)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'start',
                overflowY: 'auto',
                padding: '20px',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)'
             }}
             className="cp-scroll"
             onClick={onClose}>
            <div ref={modalRef}
                 tabIndex="-1"
                 style={{
                    marginTop: 'auto',
                    marginBottom: 'auto',
                    width: '100%',
                    maxWidth: wide ? '1200px' : tiny ? '280px' : '600px',
                    outline: 'none'
                 }}
                 className="bg-[#ffffff80] backdrop-blur-xl border-2 border-[var(--border-focus)] rounded-2xl shadow-2xl flex flex-col relative shrink-0"
                 onClick={e => e.stopPropagation()}>
                
                <div className={`flex justify-between items-center ${tiny ? 'p-1.5 px-3' : 'p-5'} border-b bg-[#ffffff80] border-[var(--border-subtle)] rounded-t-2xl sticky top-0 z-10`}>
                    <h3 className={`font-extrabold text-[var(--text-main)] ${tiny ? 'text-[10px]' : 'text-xl'} tracking-tight`}>{title}</h3>
                    <button onClick={onClose} 
                            className={`${tiny ? 'w-4 h-4 text-sm' : 'w-10 h-10 text-3xl'} flex items-center justify-center rounded-full close-button-base transition-all font-light`}
                            aria-label="Close modal">
                        &times;
                    </button>
                </div>

                <div className={`${tiny ? 'p-2' : 'p-6 md:p-8'} bg-transparent rounded-b-2xl min-h-[100px]`}>
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(content, document.body);
};