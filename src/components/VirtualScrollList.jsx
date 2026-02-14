import React, { useRef, useState, useEffect } from 'react';

export const VirtualScrollList = ({ items, itemHeight = 60, renderItem, className }) => {
    const containerRef = useRef(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [visibleHeight, setVisibleHeight] = useState(0);
    useEffect(() => {
        if (!containerRef.current) return;
        const updateHeight = () => { setVisibleHeight(containerRef.current.clientHeight); };
        updateHeight(); window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);
    const handleScroll = (e) => { setScrollTop(e.target.scrollTop); };
    const totalHeight = items.length * itemHeight;
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(items.length - 1, startIndex + Math.ceil(visibleHeight / itemHeight));
    const visibleItems = items.slice(startIndex, endIndex + 1);
    const offsetY = startIndex * itemHeight;
    if (items.length === 0) return null;
    return ( <div ref={containerRef} className={`${className} overflow-y-auto cp-scroll`} onScroll={handleScroll} style={{ height: visibleHeight || '50vh' }} > <div style={{ height: `${totalHeight}px`, position: 'relative' }}> <div style={{ position: 'absolute', top: `${offsetY}px`, width: '100%' }}> {visibleItems.map((item, index) => renderItem(item, startIndex + index))} </div> </div> </div> );
};