import { useState, useRef, useEffect, useMemo, useCallback, useDeferredValue } from 'react';
import { SafeStorage } from '../utils/storage';
import { VIEW_MODES } from '../constants';
import { traceCompute } from '../utils/perfTrace';

export const useSidebarNavigatorState = ({ classesToRender, viewMode }) => {
    const [sidebarQuery, setSidebarQuery] = useState('');
    const deferredSidebarQuery = useDeferredValue(sidebarQuery);
    const [sidebarOpenClassId, setSidebarOpenClassId] = useState(null);
    const [sidebarOpenSubjectId, setSidebarOpenSubjectId] = useState(null);
    const [sidebarWidth, setSidebarWidth] = useState(() => {
        const saved = Number(SafeStorage.getItem('ws_sidebar_width'));
        return Number.isFinite(saved) && saved >= 260 && saved <= 560 ? saved : 320;
    });
    const [sidebarSelectedTopicIds, setSidebarSelectedTopicIds] = useState(new Set());
    const [lastSidebarTopicId, setLastSidebarTopicId] = useState(null);

    const sidebarSearchRef = useRef(null);
    const sidebarWidthRef = useRef(sidebarWidth);
    const resizingSidebarRef = useRef(false);
    const resizeStartXRef = useRef(0);
    const resizeStartWidthRef = useRef(sidebarWidth);
    const lastFilterRef = useRef({ q: '', source: null, result: null });

    useEffect(() => {
        sidebarWidthRef.current = sidebarWidth;
        SafeStorage.setItem('ws_sidebar_width', String(sidebarWidth));
    }, [sidebarWidth]);

    useEffect(() => {
        const handleMouseMove = (event) => {
            if (!resizingSidebarRef.current) return;
            const delta = event.clientX - resizeStartXRef.current;
            const next = Math.max(260, Math.min(560, resizeStartWidthRef.current + delta));
            setSidebarWidth(next);
        };
        const handleMouseUp = () => {
            resizingSidebarRef.current = false;
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const beginSidebarResize = useCallback((event) => {
        event.preventDefault();
        resizingSidebarRef.current = true;
        resizeStartXRef.current = event.clientX;
        resizeStartWidthRef.current = sidebarWidthRef.current;
    }, []);

    useEffect(() => {
        lastFilterRef.current = { q: '', source: null, result: null };
    }, [classesToRender]);

    const sidebarClasses = useMemo(
        () => traceCompute('sidebar.filter.sidebarClasses', () => {
            const q = deferredSidebarQuery.trim().toLowerCase();
            if (!q) return classesToRender;
            const prev = lastFilterRef.current;
            const canNarrowFromPrevious =
                prev.source === classesToRender &&
                prev.result &&
                prev.q &&
                q.startsWith(prev.q);
            const base = canNarrowFromPrevious ? prev.result : classesToRender;
            const filtered = base
                .map(cls => {
                    const classHit = cls.name.toLowerCase().includes(q);
                    const subjects = cls.subjects
                        .map(subj => {
                            const subjectHit = subj.name.toLowerCase().includes(q);
                            const topics = subj.topics.filter(topic => topic.title.toLowerCase().includes(q));
                            if (subjectHit || topics.length > 0 || classHit) return { ...subj, topics: classHit || subjectHit ? subj.topics : topics };
                            return null;
                        })
                        .filter(Boolean);
                    if (classHit || subjects.length > 0) return { ...cls, subjects };
                    return null;
                })
                .filter(Boolean);
            lastFilterRef.current = { q, source: classesToRender, result: filtered };
            return filtered;
        }),
        [classesToRender, deferredSidebarQuery]
    );

    const sidebarRows = useMemo(
        () => traceCompute('sidebar.filter.sidebarRows', () => {
            if (viewMode === VIEW_MODES.QUICK_INBOX) return [];
            const rows = [];
            const forceExpand = Boolean(deferredSidebarQuery.trim());
            sidebarClasses.forEach(cls => {
                rows.push({ type: 'class', id: cls.id, cls });
                const classOpen = forceExpand || sidebarOpenClassId === cls.id;
                if (!classOpen) return;
                cls.subjects.forEach(subj => {
                    rows.push({ type: 'subject', id: `${cls.id}:${subj.id}`, cls, subj });
                    const subjectOpen = forceExpand || sidebarOpenSubjectId === subj.id;
                    if (!subjectOpen) return;
                    subj.topics.forEach(topic => {
                        rows.push({ type: 'topic', id: `${cls.id}:${subj.id}:${topic.id}`, cls, subj, topic });
                    });
                });
            });
            return rows;
        }),
        [viewMode, sidebarClasses, sidebarOpenClassId, sidebarOpenSubjectId, deferredSidebarQuery]
    );

    const visibleSidebarTopicIds = useMemo(
        () => sidebarRows.filter(r => r.type === 'topic').map(r => r.topic.id),
        [sidebarRows]
    );

    const handleSidebarTopicSelection = useCallback((topicId, shiftKey = false) => {
        if (shiftKey && lastSidebarTopicId && visibleSidebarTopicIds.includes(lastSidebarTopicId) && visibleSidebarTopicIds.includes(topicId)) {
            const a = visibleSidebarTopicIds.indexOf(lastSidebarTopicId);
            const b = visibleSidebarTopicIds.indexOf(topicId);
            const [start, end] = a < b ? [a, b] : [b, a];
            const range = visibleSidebarTopicIds.slice(start, end + 1);
            setSidebarSelectedTopicIds(prev => {
                const next = new Set(prev);
                range.forEach(id => next.add(id));
                return next;
            });
        } else {
            setSidebarSelectedTopicIds(prev => {
                const next = new Set(prev);
                if (next.has(topicId)) next.delete(topicId);
                else next.add(topicId);
                return next;
            });
        }
        setLastSidebarTopicId(topicId);
    }, [lastSidebarTopicId, visibleSidebarTopicIds]);

    return {
        sidebarQuery,
        setSidebarQuery,
        sidebarOpenClassId,
        setSidebarOpenClassId,
        sidebarOpenSubjectId,
        setSidebarOpenSubjectId,
        sidebarWidth,
        sidebarSelectedTopicIds,
        setSidebarSelectedTopicIds,
        sidebarSearchRef,
        beginSidebarResize,
        sidebarRows,
        visibleSidebarTopicIds,
        handleSidebarTopicSelection
    };
};
