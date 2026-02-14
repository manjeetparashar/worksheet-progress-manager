import { VIEW_MODES, STALL_DAYS } from '../constants';

export function classifyTopic(t, now, stallCutoff) {
    const total = t.items.length; const done = t.items.filter(i => i.checked).length;
    if (total === 0 || done === 0) return 'NotStarted';
    if (done === total) return 'Complete';
    const lastActivity = t.items.reduce((max, i) => { if (i.checked && i.checkedAt) { const d = new Date(i.checkedAt).getTime(); return d > max ? d : max; } return max; }, 0);
    return (lastActivity !== 0 && lastActivity < stallCutoff) ? 'Stalled' : 'InProgress';
}

export function calculateProgress(items) {const done=items.filter(i=>i.checked).length;return{done,total:items.length,percent:items.length?Math.round((done/items.length)*100):0}};

export function checkFilters(t, filters, now, status) {
   if (filters.has('Overdue') && !(t.dueDate && new Date(t.dueDate) < now)) return false;
   if (filters.has('Stalled') && status !== 'Stalled') return false;
   if (filters.has('High Priority') && t.priority !== 'High') return false;
   if (filters.has('Notes') && (!t.notes || t.notes.trim() === '')) return false;
   return true;
}

export function isTopicVisible(t, viewMode = VIEW_MODES.TODAY, filters = new Set()) {
    const now = Date.now();
    const status = classifyTopic(t, now, now - (STALL_DAYS * 86400000));
    
    // 1. View Mode Logic
    if (viewMode === VIEW_MODES.TODAY) {
        // Active, Stalled, Overdue, or Fresh
        return (status === 'InProgress' || status === 'Stalled' || 
               (t.dueDate && new Date(t.dueDate) < now + 172800000) ||
               ((now - new Date(t.createdAt || 0).getTime()) < 86400000)) && checkFilters(t, filters, now, status);
    }
    
    if (viewMode === VIEW_MODES.DUE_WEEK) {
         // Due within 7 days OR Overdue
         const nextWeek = now + (7 * 24 * 60 * 60 * 1000);
         return (t.dueDate && new Date(t.dueDate) < nextWeek && status !== 'Complete') && checkFilters(t, filters, now, status);
    }
    
    if (viewMode === VIEW_MODES.REFERENCE) {
        // Only Complete items
        return status === 'Complete' && checkFilters(t, filters, now, status);
    }
    
    if (viewMode === VIEW_MODES.QUICK_INBOX) {
        return false; // Handled specially in App
    }
    
    // Active View (Default): Show everything that passes filters
    return checkFilters(t, filters, now, status);
}

export function buildClassesForView(classes, viewMode, filters = new Set()) {
    let list = viewMode === VIEW_MODES.ARCHIVED ? classes.filter(c => c.archived) : classes.filter(c => !c.archived);
    if (viewMode === VIEW_MODES.TODAY) {
        return list.map(c => ({
            ...c,
            subjects: c.subjects.map(s => ({
                ...s,
                topics: [...s.topics]
                    .filter(t => isTopicVisible(t, VIEW_MODES.TODAY, filters))
                    .map(t => ({ ...t, _score: getTodayViewPriorityScore(t) }))
                    .sort((a, b) => b._score - a._score)
            })).filter(s => s.topics.length > 0)
        })).filter(c => c.subjects.length > 0);
    }
    if (viewMode === VIEW_MODES.QUICK_INBOX) return [];
    const hasFilters = filters.size > 0 || viewMode === VIEW_MODES.DUE_WEEK || viewMode === VIEW_MODES.REFERENCE;
    if (!hasFilters) return list;
    return list.map(c => ({
        ...c,
        subjects: c.subjects.map(s => ({ ...s, topics: s.topics.filter(t => isTopicVisible(t, viewMode, filters)) }))
            .filter(s => s.topics.length > 0)
    })).filter(c => c.subjects.length > 0);
}

export const getTodayViewPriorityScore = (topic) => {
    let score = 0; const now = new Date();
    if (topic.dueDate && new Date(topic.dueDate) < now) { const daysOverdue = Math.ceil((now - new Date(topic.dueDate)) / (1000 * 60 * 60 * 24)); score += 100 + Math.min(daysOverdue * 10, 100); }
    const completion = calculateProgress(topic.items).percent;
    if (completion >= 80 && completion < 100) { const pending = topic.items.filter(i => !i.checked).length; if (pending <= 10) score += 80 + (completion - 80); }
    if (topic.priority === 'High') score += 50; else if (topic.priority === 'Medium') score += 30;
    const lastActivity = topic.items.reduce((latest, i) => { if (i.checkedAt) { const time = new Date(i.checkedAt).getTime(); return time > latest ? time : latest; } return latest; }, 0);
    if (lastActivity > 0) { const hoursSince = (now.getTime() - lastActivity) / (1000 * 60 * 60); if (hoursSince < 24) score += Math.max(0, 20 - Math.floor(hoursSince)); }
    if (topic.createdAt) { const hoursOld = (now.getTime() - new Date(topic.createdAt).getTime()) / (1000 * 60 * 60); if (hoursOld < 24) score += Math.max(0, 15 - Math.floor(hoursOld)); }
    return score;
};

export function detectQuickWins(topics) {
    return topics.filter(t => { const {done, total, percent} = calculateProgress(t.items); const pending = total - done; return (percent >= 80 && percent < 100 && pending <= 10 && total > 0); }).map(t => { const pending = t.items.filter(i => !i.checked).length; return { ...t, pendingCount: pending, estimatedMinutes: pending * 3, urgency: t.completion >= 90 ? 'VeryHigh' : 'High' }; }).sort((a, b) => b.completion - a.completion);
}

export function detectZombieTopics(topics) {
    const now = Date.now();
    return topics.filter(t => { if (!t.createdAt) return false; const age = (now - new Date(t.createdAt).getTime()) / (1000*60*60*24); const isNeverStarted = t.items.every(i => !i.checked); return age > 90 && isNeverStarted && t.items.length > 0; }).map(t => { const ageInDays = Math.floor((now - new Date(t.createdAt).getTime()) / (1000*60*60*24)); return { ...t, ageInDays, ageCategory: ageInDays > 365 ? 'Ancient' : ageInDays > 180 ? 'Old' : 'Stale' }; }).sort((a, b) => b.ageInDays - a.ageInDays);
}

export function getNextPendingTarget(classes, currentItemId = null) {
    const pending = [];
    classes.forEach(c => {
        if (c.archived) return;
        c.subjects.forEach(s => {
            s.topics.forEach(t => {
                t.items.forEach(i => {
                    if (!i.checked) {
                        pending.push({
                            classId: c.id,
                            subjectId: s.id,
                            topicId: t.id,
                            itemId: i.id
                        });
                    }
                });
            });
        });
    });

    if (pending.length === 0) return null;
    const currentIndex = currentItemId ? pending.findIndex(i => i.itemId === currentItemId) : -1;
    return pending[(currentIndex + 1) % pending.length];
}

export function computeEnhancedStats(classes, includeArchived = false) {
    const now = new Date(); const stallCutoff = now.getTime() - (STALL_DAYS * 86400000);
    const stats = { totalClasses: 0, totalSubjects:0, totalTopics:0, totalItems:0, completedItems:0, overallCompletion:0, classDetails:[], subjectDetails:[], topicDetails:[], itemDetails:[], completionBySubject:{}, overdueTopics:[], statusCounts:{Complete:0,InProgress:0,Stalled:0,NotStarted:0}, timeEstimates: { total: 0, completed: 0 }, allItems: [], itemStats: { total: 0, completed: 0, pending: 0 }, quickWins: [], zombieTopics: [] };
    classes.forEach(c => {
        if(c.archived && !includeArchived) return; 
        stats.totalClasses++;
        const classItems = c.subjects.flatMap(s => s.topics.flatMap(t => t.items));
        const classDone = classItems.filter(i => i.checked).length;
        const classCompletion = classItems.length > 0 ? Math.round((classDone / classItems.length) * 100) : 0;
        c.subjects.forEach(s => {
            stats.totalSubjects++;
            if(!stats.completionBySubject[s.name]) stats.completionBySubject[s.name]={total:0,completed:0};
            const subjectItems = s.topics.flatMap(t => t.items);
            const subjectDone = subjectItems.filter(i => i.checked).length;
            const subjectCompletion = subjectItems.length > 0 ? Math.round((subjectDone / subjectItems.length) * 100) : 0;
            s.topics.forEach(t => {
                stats.totalTopics++;
                const topicDone=t.items.filter(i=>i.checked).length;
                const pct=t.items.length>0?Math.round((topicDone/t.items.length)*100):0;
                const status = classifyTopic(t, now, stallCutoff);
                stats.statusCounts[status]++;
                const isOverdue = t.dueDate && new Date(t.dueDate)<now && pct<100;
                if(isOverdue) stats.overdueTopics.push({ className:c.name, subjectName:s.name, topicTitle:t.title, dueDate:t.dueDate, completion:pct, classId: c.id, subjectId: s.id, topicId: t.id });
                stats.topicDetails.push({ id: t.id, classId: c.id, subjectId: s.id, className:c.name, subjectName:s.name, title:t.title, completion:pct, dueDate:t.dueDate||null, isOverdue, status, items: t.items, createdAt: t.createdAt, itemCount: t.items.length, completedItems: topicDone, priority: t.priority });
                t.items.forEach((i, itemIndex) => {
                    stats.totalItems++; stats.completionBySubject[s.name].total++; stats.itemStats.total++;
                    if(i.checked) { stats.completedItems++; stats.completionBySubject[s.name].completed++; stats.itemStats.completed++; } else { stats.itemStats.pending++; }
                    stats.allItems.push({ id: i.id, classId: c.id, subjectId: s.id, topicId: t.id, className: c.name, subjectName: s.name, topicTitle: t.title, label: i.label, checked: i.checked, checkedAt: i.checkedAt, createdAt: i.createdAt, itemIndex: itemIndex, hierarchy: `${c.name} > ${s.name} > ${t.title}` });
                });
            });
            const maturityScore = Math.min(100, Math.round((s.topics.filter(t=>classifyTopic(t,now,stallCutoff)==='Complete').length*3 + s.topics.filter(t=>classifyTopic(t,now,stallCutoff)==='InProgress').length*1) / ((s.topics.length||1)*3) * 100));
            stats.subjectDetails.push({ id: s.id, classId: c.id, className:c.name, name:s.name, completion: subjectCompletion, maturityScore, topicCount: s.topics.length });
        });
        stats.classDetails.push({ id: c.id, name:c.name, topicCount:c.subjects.reduce((a,b)=>a+b.topics.length,0), completion: classCompletion, archived:c.archived||false });
    });
    stats.overdueTopics.sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate));
    stats.overallCompletion=stats.totalItems>0?Math.round((stats.completedItems/stats.totalItems)*100):0;
    stats.quickWins = detectQuickWins(stats.topicDetails);
    stats.quickWinsSummary = { count: stats.quickWins.length, totalPendingItems: stats.quickWins.reduce((sum, t) => sum + t.pendingCount, 0), totalEstimatedMinutes: stats.quickWins.reduce((sum, t) => sum + t.estimatedMinutes, 0) };
    stats.zombieTopics = detectZombieTopics(stats.topicDetails);
    stats.zombieSummary = { total: stats.zombieTopics.length, ancient: stats.zombieTopics.filter(z => z.ageCategory === 'Ancient').length, old: stats.zombieTopics.filter(z => z.ageCategory === 'Old').length, stale: stats.zombieTopics.filter(z => z.ageCategory === 'Stale').length };
    return stats;
}

/**
 * Synchronizes all topics in the state to the provided template.
 * Adds missing items, preserves existing ones and their status.
 */
export const syncAllTopicsToTemplate = (classes, template) => {
    let updateCount = 0;
    const newClasses = classes.map(cls => ({
        ...cls,
        subjects: cls.subjects.map(subj => ({
            ...subj,
            topics: subj.topics.map(topic => {
                const existingLabels = new Set(topic.items.map(i => i.label));
                // template is an array of objects {id, label}
                const itemsToAdd = template.filter(tplItem => !existingLabels.has(tplItem.label));
                
                if (itemsToAdd.length === 0) return topic;
                
                updateCount++;
                return {
                    ...topic,
                    items: [
                        ...topic.items,
                        ...itemsToAdd.map(tplItem => ({
                            id: `item-${Math.random().toString(36).substr(2, 9)}`,
                            label: tplItem.label,
                            checked: false,
                            createdAt: new Date().toISOString()
                        }))
                    ]
                };
            })
        }))
    }));
    return { newClasses, updateCount };
};
