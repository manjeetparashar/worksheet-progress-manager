import React, { createContext, useState, useCallback } from 'react';

export const ToastContext=createContext(()=>{});

export const ToastProvider=({children})=>{
    const[toasts,setToasts]=useState([]);
    const add=useCallback((msg,type='info')=>{const id=Date.now();setToasts(p=>[...p,{id,msg,type}]);setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),2000)},[]);
    return(<ToastContext.Provider value={add}>{children}<div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">{toasts.map(t=><div key={t.id} className={`toast-enter px-4 py-2 rounded shadow-lg text-white text-sm font-medium ${t.type==='error'?'bg-red-600':'bg-slate-800'} ${t.type==='success'?'bg-green-600':''}`}>{t.msg}</div>)}</div></ToastContext.Provider>);
};