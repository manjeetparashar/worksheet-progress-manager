export const createClassEntity = (classes, newId) => (
    [...classes, { id: newId, name: 'New Class', subjects: [], collapsed: false }]
);

export const uncollapsePath = (classes, classId, subjectId, topicId) => (
    classes.map(c => {
        if (c.id !== classId && classId !== null) return c;
        return {
            ...c,
            collapsed: false,
            subjects: c.subjects.map(s => {
                if (s.id !== subjectId && subjectId !== null) return s;
                return {
                    ...s,
                    collapsed: false,
                    topics: s.topics.map(t => {
                        if (t.id !== topicId && topicId !== null) return t;
                        return { ...t, collapsed: false };
                    })
                };
            })
        };
    })
);

export const addItemToTopicById = (classes, topicId, itemId, createdAt) => (
    classes.map(c => ({
        ...c,
        subjects: c.subjects.map(s => ({
            ...s,
            topics: s.topics.map(t => t.id === topicId
                ? { ...t, items: [...t.items, { id: itemId, label: 'New Item', checked: false, createdAt }] }
                : t)
        }))
    }))
);

export const moveItemInTopic = (classes, topicId, itemId, direction) => (
    classes.map(c => ({
        ...c,
        subjects: c.subjects.map(s => ({
            ...s,
            topics: s.topics.map(t => {
                if (t.id !== topicId) return t;
                const items = [...t.items];
                const idx = items.findIndex(i => i.id === itemId);
                if (idx === -1) return t;
                if (direction === -1 && idx === 0) return t;
                if (direction === 1 && idx === items.length - 1) return t;
                const [moved] = items.splice(idx, 1);
                items.splice(idx + direction, 0, moved);
                return { ...t, items };
            })
        }))
    }))
);

export const deleteTopicsByIds = (classes, selectedIds) => (
    classes.map(c => ({
        ...c,
        subjects: c.subjects.map(s => ({
            ...s,
            topics: s.topics.filter(t => !selectedIds.has(t.id))
        }))
    }))
);

export const markTopicsDoneByIds = (classes, selectedIds, nowIso) => (
    classes.map(c => ({
        ...c,
        subjects: c.subjects.map(s => ({
            ...s,
            topics: s.topics.map(t => selectedIds.has(t.id)
                ? {
                    ...t,
                    items: t.items.map(i => ({
                        ...i,
                        checked: true,
                        checkedAt: i.checked ? i.checkedAt : nowIso
                    }))
                }
                : t)
        }))
    }))
);

export const applySidebarMacroToTopics = (classes, targetIds, macroType, nowIso) => {
    const targetSet = new Set(targetIds);
    if (macroType === 'mark_done') return markTopicsDoneByIds(classes, targetSet, nowIso);
    if (macroType === 'delete') return deleteTopicsByIds(classes, targetSet);
    return classes;
};
