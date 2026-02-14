import React, { useState, useEffect } from 'react';
import { parseNaturalDate } from '../utils/helpers';

export const SmartDateInput = ({ value, onChange, className }) => {
    const [txt, setTxt] = useState(value || '');
    useEffect(() => { setTxt(value || ''); }, [value]);
    const handleBlur = () => { const parsed = parseNaturalDate(txt); if (parsed !== value) onChange(parsed); setTxt(parsed); };
    return ( <input type="text" value={txt} onChange={e => setTxt(e.target.value)} onBlur={handleBlur} onKeyDown={e => { if(e.key === 'Enter') { e.target.blur(); } }} placeholder="tomorrow, fri, +3d" className={className} /> );
};