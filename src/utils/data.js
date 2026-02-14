import Papa from 'papaparse';
import { DATA_VERSION, TEMPLATE_VERSION, DEFAULT_TEMPLATE } from '../constants';
import { generateId } from './helpers';
import { AppStateSchema } from './schema';

export const DataExportService={
    toCSV:data=>{
        const esc=t=>`"${String(t||'').replace(/"/g,'""')}"`;
        const rows=[['Class','Subject','Topic','Priority','Due','Item','Status','Date','Notes','TimeEstimate'].map(esc)];
        data.classes.forEach(c=>c.subjects.forEach(s=>s.topics.forEach(t=>t.items.forEach(i=>rows.push([c.name,s.name,t.title,t.priority||'',t.dueDate||'',i.label,i.checked?'Done':'Pending',i.checkedAt||'',t.notes||'',t.timeEstimate||''].map(esc))))));
        return rows.map(r=>r.join(',')).join('\n');
    }
};

export const DataImportService={
    fromCSV:text=>{
        const parsed=Papa.parse(text,{header:true,skipEmptyLines:true,dynamicTyping:false,transformHeader:h=>h.trim().toLowerCase()});
        const map=new Map();
        parsed.data.forEach(row=>{
            const cName=row.class||row.Class||'';if(!cName)return;
            const sName=row.subject||row.Subject||'Untitled Subject';
            const tTitle=row.topic||row.Topic||'Untitled Topic';
            if(!map.has(cName))map.set(cName,{id:generateId(),name:cName,subjects:new Map(),collapsed:true,archived:false});
            const c=map.get(cName); if(!c.subjects.has(sName))c.subjects.set(sName,{id:generateId(),name:sName,topics:new Map(),collapsed:true});
            const s=c.subjects.get(sName); if(!s.topics.has(tTitle))s.topics.set(tTitle,{id:generateId(),title:tTitle,items:[],notes:row.notes||'',priority:row.priority||'Medium',dueDate:row.due||'',templateVersion:TEMPLATE_VERSION,collapsed:true,timeEstimate:row.timeestimate||''});
            const status=row.status||''; s.topics.get(tTitle).items.push({id:generateId(),label:row.item||'Item',checked:status.toLowerCase()==='done',checkedAt:row.date||(status.toLowerCase()==='done'?new Date().toISOString():null)});
        });
        const data = {version:DATA_VERSION,templateVersion:TEMPLATE_VERSION,classes:Array.from(map.values()).map(c=>({...c,subjects:Array.from(c.subjects.values()).map(s=>({...s,topics:Array.from(s.topics.values())}))})),template:DEFAULT_TEMPLATE,userProfile:{name:'User'},quickInbox:[]};
        return AppStateSchema.parse(data);
    },
    validate:json=>{
        try {
            const p=JSON.parse(json);
            return AppStateSchema.safeParse(p).success;
        } catch { return false }
    },
    migrateData: data => {
        const nowIso = new Date().toISOString();
        const toArray = (value) => Array.isArray(value) ? value : [];
        const normalizeString = (value, fallback) => {
            if (typeof value === 'string' && value.trim()) return value;
            return fallback;
        };

        const normalized = {
            version: DATA_VERSION,
            templateVersion: TEMPLATE_VERSION,
            classes: toArray(data?.classes).map((cls, classIdx) => ({
                id: normalizeString(cls?.id, generateId()),
                name: normalizeString(cls?.name, `Class ${classIdx + 1}`),
                collapsed: Boolean(cls?.collapsed),
                archived: Boolean(cls?.archived),
                subjects: toArray(cls?.subjects).map((subj, subjIdx) => ({
                    id: normalizeString(subj?.id, generateId()),
                    name: normalizeString(subj?.name, `Subject ${subjIdx + 1}`),
                    collapsed: Boolean(subj?.collapsed),
                    topics: toArray(subj?.topics).map((topic, topicIdx) => ({
                        id: normalizeString(topic?.id, generateId()),
                        title: normalizeString(topic?.title, `Topic ${topicIdx + 1}`),
                        collapsed: Boolean(topic?.collapsed),
                        notes: typeof topic?.notes === 'string' ? topic.notes : '',
                        priority: ['Low', 'Medium', 'High'].includes(topic?.priority) ? topic.priority : 'Medium',
                        dueDate: typeof topic?.dueDate === 'string' ? topic.dueDate : '',
                        createdAt: typeof topic?.createdAt === 'string' ? topic.createdAt : nowIso,
                        templateVersion: Number.isFinite(topic?.templateVersion) ? topic.templateVersion : TEMPLATE_VERSION,
                        items: toArray(topic?.items).map((item, itemIdx) => {
                            const checked = Boolean(item?.checked);
                            return {
                                id: normalizeString(item?.id, generateId()),
                                label: normalizeString(item?.label, `Item ${itemIdx + 1}`),
                                checked,
                                checkedAt: checked ? (typeof item?.checkedAt === 'string' ? item.checkedAt : nowIso) : null,
                                createdAt: typeof item?.createdAt === 'string' ? item.createdAt : nowIso
                            };
                        })
                    }))
                }))
            })),
            template: toArray(data?.template).length > 0
                ? toArray(data.template).map((item, idx) => ({
                    id: normalizeString(item?.id, `tpl-${idx + 1}`),
                    label: normalizeString(item?.label, `Template Item ${idx + 1}`)
                }))
                : DEFAULT_TEMPLATE,
            userProfile: {
                name: normalizeString(data?.userProfile?.name, 'User')
            },
            quickInbox: toArray(data?.quickInbox).map((item) => ({
                id: normalizeString(item?.id, generateId()),
                text: normalizeString(item?.text, ''),
                createdAt: typeof item?.createdAt === 'string' ? item.createdAt : nowIso
            })).filter(item => item.text.length > 0)
        };

        return AppStateSchema.parse(normalized);
    },
    compatibilityReport: data => {
        const sourceVersion = Number.isFinite(data?.version) ? data.version : 'unknown';
        const classes = Array.isArray(data?.classes) ? data.classes : [];
        const subjects = classes.reduce((sum, c) => sum + (Array.isArray(c.subjects) ? c.subjects.length : 0), 0);
        const topics = classes.reduce((sum, c) => sum + (Array.isArray(c.subjects) ? c.subjects.reduce((s, subj) => s + (Array.isArray(subj.topics) ? subj.topics.length : 0), 0) : 0), 0);
        const items = classes.reduce((sum, c) => sum + (Array.isArray(c.subjects) ? c.subjects.reduce((s, subj) => s + (Array.isArray(subj.topics) ? subj.topics.reduce((t, topic) => t + (Array.isArray(topic.items) ? topic.items.length : 0), 0) : 0), 0) : 0), 0);
        const warnings = [];
        if (sourceVersion === 'unknown') warnings.push('Missing version field; migration will assume legacy format.');
        if (classes.length === 0) warnings.push('No classes found in import payload.');
        if (sourceVersion !== 'unknown' && sourceVersion < DATA_VERSION) warnings.push(`Data will be migrated from v${sourceVersion} to v${DATA_VERSION}.`);
        if (items > 5000) warnings.push('Large dataset detected; import may take a few seconds.');
        return {
            sourceVersion,
            targetVersion: DATA_VERSION,
            classes: classes.length,
            subjects,
            topics,
            items,
            warnings
        };
    }
};

export const DataMigrationService = {
    repairCorruptedLabels: (data) => {
        if (!data.classes) return data;
        data.classes.forEach(c => {
            c.subjects.forEach(s => {
                s.topics.forEach(t => {
                    t.items.forEach(i => {
                        if (i.label && typeof i.label === 'object') {
                            i.label = i.label.label || 'Repaired Item';
                        }
                    });
                });
            });
        });
        return data;
    },
    ensureTimestamps: (data) => {
        if (!data.classes) return data;
        data.classes.forEach(c => { c.subjects.forEach(s => { s.topics.forEach(t => {
            if (!t.createdAt) { t.createdAt = new Date().toISOString(); }
            if (!t.lastActivity) {
                const checkedItems = t.items.filter(i => i.checked && i.checkedAt);
                if (checkedItems.length > 0) t.lastActivity = checkedItems.reduce((latest, i) => new Date(i.checkedAt) > new Date(latest) ? i.checkedAt : latest, checkedItems[0].checkedAt); else t.lastActivity = t.createdAt;
            }
            t.items.forEach(i => { if (!i.createdAt) { i.createdAt = i.checkedAt || t.createdAt; } });
        }); }); });
        data._timestampsMigrated = true;
        return data;
    }
};
