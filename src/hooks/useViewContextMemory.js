import { useState, useRef, useEffect } from 'react';
import { SafeStorage } from '../utils/storage';
import { VIEW_MODES } from '../constants';
import { safeJSONParse } from '../utils/helpers';

export const useViewContextMemory = ({
    viewMode,
    setFilters,
    filters,
    bulkSelection,
    contextSelection,
    setContextSelection,
    sidebarQuery,
    setSidebarQuery,
    sidebarOpenClassId,
    setSidebarOpenClassId,
    sidebarOpenSubjectId,
    setSidebarOpenSubjectId,
    classesToRender
}) => {
    const [viewContextMap, setViewContextMap] = useState(() => safeJSONParse(SafeStorage.getItem('ws_view_context_map') || '{}') || {});
    const previousViewModeRef = useRef(viewMode);
    const viewContextMapRef = useRef(viewContextMap);

    useEffect(() => {
        viewContextMapRef.current = viewContextMap;
        SafeStorage.setItem('ws_view_context_map', JSON.stringify(viewContextMap));
    }, [viewContextMap]);

    useEffect(() => {
        const prevViewMode = previousViewModeRef.current;
        if (prevViewMode !== viewMode) {
            const previousSnapshot = {
                contextSelection,
                sidebarQuery,
                sidebarOpenClassId,
                sidebarOpenSubjectId
            };
            setViewContextMap(prev => ({ ...prev, [prevViewMode]: previousSnapshot }));

            const nextSnapshot = viewContextMapRef.current[viewMode];
            if (nextSnapshot) {
                setContextSelection(nextSnapshot.contextSelection || { classId: null, subjectId: null, topicId: null });
                setSidebarQuery(nextSnapshot.sidebarQuery || '');
                setSidebarOpenClassId(nextSnapshot.sidebarOpenClassId || null);
                setSidebarOpenSubjectId(nextSnapshot.sidebarOpenSubjectId || null);
            } else {
                setContextSelection({ classId: null, subjectId: null, topicId: null });
                setSidebarOpenClassId(null);
                setSidebarOpenSubjectId(null);
                setSidebarQuery('');
            }
            previousViewModeRef.current = viewMode;
        }

        bulkSelection.clearSelection();
        if ([VIEW_MODES.REFERENCE, VIEW_MODES.QUICK_INBOX, VIEW_MODES.DUE_WEEK].includes(viewMode)) setFilters(new Set());
    }, [viewMode]);

    useEffect(() => {
        const snapshot = {
            contextSelection,
            sidebarQuery,
            sidebarOpenClassId,
            sidebarOpenSubjectId
        };
        setViewContextMap(prev => {
            const current = prev[viewMode];
            if (
                current &&
                current.sidebarQuery === snapshot.sidebarQuery &&
                current.sidebarOpenClassId === snapshot.sidebarOpenClassId &&
                current.sidebarOpenSubjectId === snapshot.sidebarOpenSubjectId &&
                current.contextSelection?.classId === snapshot.contextSelection.classId &&
                current.contextSelection?.subjectId === snapshot.contextSelection.subjectId &&
                current.contextSelection?.topicId === snapshot.contextSelection.topicId
            ) return prev;
            return { ...prev, [viewMode]: snapshot };
        });
    }, [viewMode, contextSelection, sidebarQuery, sidebarOpenClassId, sidebarOpenSubjectId]);

    useEffect(() => { SafeStorage.setItem('ws_view_mode', viewMode); }, [viewMode]);
    useEffect(() => { SafeStorage.setItem('ws_filters', JSON.stringify(Array.from(filters))); }, [filters]);

    useEffect(() => {
        if (!contextSelection.classId) return;
        const cls = classesToRender.find(c => c.id === contextSelection.classId);
        if (!cls) {
            setContextSelection({ classId: null, subjectId: null, topicId: null });
            return;
        }
        if (contextSelection.subjectId) {
            const subj = cls.subjects.find(s => s.id === contextSelection.subjectId);
            if (!subj) {
                setContextSelection({ classId: cls.id, subjectId: null, topicId: null });
                return;
            }
            if (contextSelection.topicId && !subj.topics.some(t => t.id === contextSelection.topicId)) {
                setContextSelection({ classId: cls.id, subjectId: subj.id, topicId: null });
            }
        }
    }, [classesToRender, contextSelection, setContextSelection]);
};
