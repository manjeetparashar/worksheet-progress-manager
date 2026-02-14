import { DB_NAME, STORE_NAME } from '../constants';

export const SafeStorage = {
    getItem: (key) => { try { return localStorage.getItem(key); } catch (e) { return null; } },
    setItem: (key, value) => { try { localStorage.setItem(key, value); } catch (e) { } },
    removeItem: (key) => { try { localStorage.removeItem(key); } catch (e) { } }
};

export const OperationCanceller = {
    current: null,
    cancel: () => { if (OperationCanceller.current) { OperationCanceller.current.cancelled = true; OperationCanceller.current = null; } },
    create: () => { const controller = { cancelled: false }; OperationCanceller.current = controller; return controller; },
    check: (controller) => { return controller && controller.cancelled; }
};

export const IDBService={
    db:null, available: true,
    init:()=>new Promise((res)=>{
        if(!IDBService.available) return res(null);
        try {
            if(typeof indexedDB === 'undefined') { IDBService.available = false; return res(null); }
            const r=indexedDB.open(DB_NAME,1); 
            r.onupgradeneeded=e=>{ try { if(!e.target.result.objectStoreNames.contains(STORE_NAME)) e.target.result.createObjectStore(STORE_NAME); } catch(err) { } }; 
            r.onsuccess=e=>{IDBService.db=e.target.result;res(IDBService.db)}; 
            r.onerror=e=>{ IDBService.available=false; res(null); };
        } catch(e) { IDBService.available=false; res(null); }
    }),
    put:async(k,v,retries = 3)=>{
        if(!IDBService.available) return; if(!IDBService.db) await IDBService.init(); if(!IDBService.db) return;
        
        for (let i = 0; i < retries; i++) {
            try { 
                return await new Promise((res, rej)=>{
                    const r=IDBService.db.transaction(STORE_NAME,'readwrite').objectStore(STORE_NAME).put(v,k); 
                    r.onsuccess=()=>res(); 
                    r.onerror=()=>rej(r.error); 
                });
            } catch(e) {
                if (i === retries - 1) {
                    IDBService.available = false;
                    console.error('IDB Put failed after retries:', e);
                    throw e;
                }
                await new Promise(r => setTimeout(r, 100 * (i + 1)));
            }
        }
    },
    get:async k=>{
        if(!IDBService.available) return null; if(!IDBService.db) await IDBService.init(); if(!IDBService.db) return null;
        return new Promise((res)=>{ try { const r=IDBService.db.transaction(STORE_NAME,'readonly').objectStore(STORE_NAME).get(k); r.onsuccess=()=>res(r.result); r.onerror=()=>{ res(null); }; } catch(e) { IDBService.available=false; res(null); } })
    }
};