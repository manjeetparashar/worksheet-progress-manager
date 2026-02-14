import LZString from 'lz-string';

export const generateId = () => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2,9)}`;

export const historyCompress = state => LZString.compress(JSON.stringify(state));
export const historyDecompress = s => JSON.parse(LZString.decompress(s));
export const safeJSONParse = (str) => { try { return JSON.parse(str); } catch (e) { return null; } };

export const debounce = (func, wait) => { 
    let timeout; 
    const executedFunction = (...args) => { 
        clearTimeout(timeout); 
        timeout = setTimeout(() => func.apply(this, args), wait); 
    };
    executedFunction.flush = () => {
        if(timeout) {
            clearTimeout(timeout);
        }
    };
    return executedFunction;
};

export const parseNaturalDate = (input) => {
    if(!input||input.trim()==='')return '';
    const today=new Date();today.setHours(0,0,0,0);
    const lc=input.toLowerCase().trim();
    if(lc==='tomorrow'||lc==='tmr'||lc==='tom'){const d=new Date(today);d.setDate(d.getDate()+1);return d.toISOString().split('T')[0];}
    if(lc==='today'||lc==='now'){return today.toISOString().split('T')[0];}
    if(lc==='yest'||lc==='yesterday'){const d=new Date(today);d.setDate(d.getDate()-1);return d.toISOString().split('T')[0];}
    const dayMatch=lc.match(/^(next\s+)?(mon|tue|wed|thu|fri|sat|sun)(day)?$/);
    if(dayMatch){
        const dayNames=['sun','mon','tue','wed','thu','fri','sat'];
        const dayAbbr=dayMatch[2];
        const targetDay=dayNames.indexOf(dayAbbr);
        const currentDay=today.getDay();
        let daysToAdd=targetDay-currentDay;
        if(daysToAdd<=0||dayMatch[1])daysToAdd+=7;
        const d=new Date(today);d.setDate(d.getDate()+daysToAdd);
        return d.toISOString().split('T')[0];
    }
    const relDayMatch=lc.match(/^\+(\d+)d?$/);
    if(relDayMatch){const d=new Date(today);d.setDate(d.getDate()+parseInt(relDayMatch[1]));return d.toISOString().split('T')[0];}
    const relWeekMatch=lc.match(/^\+(\d+)w$/);
    if(relWeekMatch){const d=new Date(today);d.setDate(d.getDate()+(parseInt(relWeekMatch[1])*7));return d.toISOString().split('T')[0];}
    const mdMatch=lc.match(/^(\d{1,2})\/(\d{1,2})$/);
    if(mdMatch){
        const month=parseInt(mdMatch[1])-1;
        const day=parseInt(mdMatch[2]);
        if(month>=0&&month<12&&day>=1&&day<=31){
            let d=new Date(today.getFullYear(),month,day);
            if(d<today)d.setFullYear(d.getFullYear()+1);
            return d.toISOString().split('T')[0];
        }
    }
    const parsed=new Date(input);
    return isNaN(parsed)?input:parsed.toISOString().split('T')[0];
};