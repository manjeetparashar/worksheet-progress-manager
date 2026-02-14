import { useState, useEffect, useCallback } from 'react';
import { SafeStorage } from '../utils/storage';
import { safeJSONParse, generateId } from '../utils/helpers';

export const useBookmarks = ({ contextSelection, state, toast }) => {
    const [bookmarks, setBookmarks] = useState(() => safeJSONParse(SafeStorage.getItem('ws_bookmarks') || '[]') || []);

    useEffect(() => {
        SafeStorage.setItem('ws_bookmarks', JSON.stringify(bookmarks));
    }, [bookmarks]);

    const addCurrentBookmark = useCallback(() => {
        if (!contextSelection.classId) {
            toast('Select a class/subject/topic before bookmarking', 'info');
            return;
        }
        const cls = state?.classes.find(c => c.id === contextSelection.classId);
        const subj = cls?.subjects.find(s => s.id === contextSelection.subjectId);
        const topic = subj?.topics.find(t => t.id === contextSelection.topicId);
        const label = topic?.title || subj?.name || cls?.name || 'Bookmark';
        const path = [cls?.name, subj?.name, topic?.title].filter(Boolean).join(' > ');
        setBookmarks(prev => [{ id: generateId(), label, path, ...contextSelection }, ...prev].slice(0, 30));
        toast('Bookmark added', 'success');
    }, [contextSelection, state, toast]);

    return { bookmarks, setBookmarks, addCurrentBookmark };
};
