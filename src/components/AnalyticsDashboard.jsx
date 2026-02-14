import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { VirtualScrollList } from './VirtualScrollList';
import { TestRunner } from '../utils/test';
import { syncAllTopicsToTemplate } from '../utils/logic';

export const AnalyticsDashboard = ({ state, stats, onNavigate, onUpdateState, onToast }) => {
    const [tab, setTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [healthLogs, setHealthLogs] = useState([]);
    const [running, setRunning] = useState(false);

    const runDiagnostics = useCallback(async () => {
        setRunning(true);
        setHealthLogs([]); 
        await new Promise(r => setTimeout(r, 500));
        const logs = await TestRunner.runAll(state);
        setHealthLogs(logs);
        setRunning(false);
    }, [state]);

    useEffect(() => {
        if (tab === 'health' && healthLogs.length === 0 && !running) {
            runDiagnostics();
        }
    }, [tab, healthLogs.length, running, runDiagnostics]);
    
    const hierarchicalStats = useMemo(() => {
        const classStats = stats.classDetails.map(cls => ({ ...cls, statusBreakdown: { Complete: stats.topicDetails.filter(t=>t.classId===cls.id && t.status==='Complete').length, InProgress: stats.topicDetails.filter(t=>t.classId===cls.id && t.status==='InProgress').length, Stalled: stats.topicDetails.filter(t=>t.classId===cls.id && t.status==='Stalled').length, NotStarted: stats.topicDetails.filter(t=>t.classId===cls.id && t.status==='NotStarted').length } }));
        const topicStats = stats.topicDetails.map(t => ({ ...t, itemCount: t.items.length, completedItems: t.items.filter(i=>i.checked).length, pendingItems: t.items.filter(i=>!i.checked).length }));
        return { classStats, topicStats };
    }, [stats]);

    const filteredTopics = useMemo(() => {
        if (!searchTerm) return hierarchicalStats.topicStats;
        const s = searchTerm.toLowerCase();
        return hierarchicalStats.topicStats.filter(t => t.title.toLowerCase().includes(s) || t.className.toLowerCase().includes(s) || t.subjectName.toLowerCase().includes(s));
    }, [hierarchicalStats.topicStats, searchTerm]);

    const archiveZombies = (category) => {
        if(confirm(`Archive all ${stats.zombieSummary[category.toLowerCase()]} ${category.toLowerCase()} zombie topics?`)) {
            const ids = stats.zombieTopics.filter(z => z.ageCategory === category).map(t => t.id);
            onUpdateState(prev => ({
                ...prev,
                classes: prev.classes.map(c => ({...c, subjects: c.subjects.map(s => ({...s, topics: s.topics.filter(t => !ids.includes(t.id))}))}))
            }));
            onToast(`Archived ${ids.length} ${category.toLowerCase()} zombies`, 'success');
        }
    };

    const handleBatchSync = () => {
        if(confirm('This will add missing checklist items from your global template to ALL topics. Existing progress will be preserved. Proceed?')) {
            const { newClasses, updateCount } = syncAllTopicsToTemplate(state.classes, state.template);
            onUpdateState(prev => ({ ...prev, classes: newClasses }));
            onToast(`Successfully synced ${updateCount} topics to template`, 'success');
        }
    };

    const getTabClass = (t) => {
        if (['classes', 'subjects', 'topics'].includes(t)) return 'tab-hierarchy';
        return `tab-${t}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex space-x-2 border-b-2 border-[var(--border-subtle)] overflow-x-auto pb-px shrink-0 no-print"> 
                {['overview', 'quickwins', 'insights', 'classes', 'subjects', 'topics', 'zombies', 'overdue', 'health'].map(t => ( 
                    <button 
                        key={t} 
                        onClick={() => { setTab(t); setSearchTerm(''); }} 
                        className={`px-3 py-1.5 capitalize whitespace-nowrap btn-high-speed btn-harmonic rounded-t-md ${getTabClass(t)} ${tab === t ? 'active shadow-inner' : ''}`}
                    > 
                        {t} 
                    </button> 
                ))} 
            </div>
            
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {tab === 'overview' && (
                <div className="space-y-6">
                    <div className="bg-[#ffffff80] backdrop-blur-md border-2 border-[#262624] rounded-2xl p-6 shadow-md">
                        <div className="flex justify-between items-center mb-6">
                            <div><h2 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter">System Pulse</h2></div>
                            <div className="text-right">
                                <div className="text-4xl font-black text-[var(--text-accent)]">{stats.overallCompletion}%</div>
                                <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Total Mastery</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <button onClick={() => setTab('classes')} className="rounded-xl p-4 text-center btn-high-speed btn-harmonic tab-hierarchy shadow-md">
                                <div className="text-2xl font-bold group-hover:scale-110 transition-transform tracking-tight">{stats.totalClasses}</div>
                                <div className="text-[10px] font-bold uppercase mt-1 tracking-widest">Classes</div>
                            </button>
                            <button onClick={() => setTab('topics')} className="rounded-xl p-4 text-center btn-high-speed btn-harmonic tab-overview shadow-md">
                                <div className="text-2xl font-bold group-hover:scale-110 transition-transform tracking-tight">{stats.completedItems}</div>
                                <div className="text-[10px] font-bold uppercase mt-1 tracking-widest">Done Items</div>
                            </button>
                            <button onClick={() => setTab('overdue')} className="rounded-xl p-4 text-center btn-high-speed btn-harmonic tab-overdue shadow-md">
                                <div className="text-2xl font-bold group-hover:scale-110 transition-transform tracking-tight">{stats.overdueTopics.length}</div>
                                <div className="text-[10px] font-bold uppercase mt-1 tracking-widest">Overdue</div>
                            </button>
                            <button onClick={() => setTab('zombies')} className="rounded-xl p-4 text-center btn-high-speed btn-harmonic tab-hierarchy shadow-md">
                                <div className="text-2xl font-bold group-hover:scale-110 transition-transform tracking-tight">{stats.statusCounts.Stalled}</div>
                                <div className="text-[10px] font-bold uppercase mt-1 tracking-widest">Stalled</div>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={handleBatchSync} className="p-5 rounded-2xl text-left btn-high-speed btn-harmonic tab-health shadow-lg group">
                            <div className="flex justify-between items-center mb-2">
                                <div className="font-bold text-sm uppercase tracking-wider">Batch Template Sync</div>
                                <span className="text-xl group-hover:translate-x-1 transition-transform">🔄</span>
                            </div>
                            <div className="text-xs font-bold opacity-80 leading-relaxed">Add missing checklist items from your global template to ALL topics instantly.</div>
                        </button>
                        <button onClick={() => setTab('health')} className="p-5 rounded-2xl text-left btn-high-speed btn-harmonic tab-health shadow-lg group">
                            <div className="flex justify-between items-center mb-2">
                                <div className="font-bold text-sm uppercase tracking-wider">Deep Diagnostics</div>
                                <span className="text-xl group-hover:rotate-12 transition-transform">🔍</span>
                            </div>
                            <div className="text-xs font-bold opacity-80 leading-relaxed">Run full system integrity, schema validation, and performance benchmarks.</div>
                        </button>
                    </div>
                </div>
            )}

            {tab === 'quickwins' && (
                <div className="space-y-4">
                    <div className="bg-[#ffffff80] backdrop-blur-md border-2 border-[#262624] rounded-2xl p-6 shadow-md">
                        <h2 className="text-xl font-bold text-[var(--text-main)] mb-4 uppercase tracking-tight">🎯 Quick Wins</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <button onClick={() => stats.quickWins[0] && onNavigate(stats.quickWins[0].classId, stats.quickWins[0].subjectId, stats.quickWins[0].id)} 
                                    className="rounded-xl p-3 text-center btn-high-speed btn-create btn-crispy shadow-md group">
                                <div className="text-2xl font-bold">{stats.quickWins.length}</div>
                                <div className="text-[10px] font-bold uppercase mt-1">Topics</div>
                            </button>
                            <button onClick={() => stats.quickWins[0] && onNavigate(stats.quickWins[0].classId, stats.quickWins[0].subjectId, stats.quickWins[0].id)} 
                                    className="rounded-xl p-3 text-center btn-high-speed btn-create btn-crispy shadow-md group">
                                <div className="text-2xl font-bold">{stats.quickWinsSummary.totalPendingItems}</div>
                                <div className="text-[10px] font-bold uppercase mt-1">Items</div>
                            </button>
                            <button onClick={() => stats.quickWins[0] && onNavigate(stats.quickWins[0].classId, stats.quickWins[0].subjectId, stats.quickWins[0].id)} 
                                    className="rounded-xl p-3 text-center btn-high-speed btn-create btn-crispy shadow-md group">
                                <div className="text-2xl font-bold">~{stats.quickWinsSummary.totalEstimatedMinutes}</div>
                                <div className="text-[10px] font-bold uppercase mt-1">Mins</div>
                            </button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {stats.quickWins.map((topic, idx) => (
                            <button key={idx} onClick={() => onNavigate(topic.classId, topic.subjectId, topic.id)} className="w-full rounded-xl p-4 btn-high-speed btn-nav transition-all text-left group flex flex-col gap-3 shadow-md">
                                <div className="flex justify-between items-start w-full">
                                    <div className="flex-1">
                                        <div className="font-black tracking-tight group-hover:text-inherit">{topic.title}</div>
                                        <div className="text-[10px] font-black uppercase opacity-70">{topic.className} → {topic.subjectName}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black">{topic.completion}%</div>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-[var(--bg-app)]/30 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-current" style={{width: `${topic.completion}%`}}></div>
                                </div>
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex gap-3">
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-black/20 rounded uppercase flex gap-1">
                                            <span>{topic.pendingCount}</span>
                                            <span>left</span>
                                        </span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-black/20 rounded uppercase flex gap-1">
                                            <span>~{topic.estimatedMinutes}</span>
                                            <span>min</span>
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase group-hover:scale-110 transition-transform">Act Now →</span>
                                </div>
                            </button>
                        ))}
                    </div>
                    {stats.quickWins.length === 0 && <div className="text-center py-12 text-[var(--text-muted)] font-bold italic"><div className="text-4xl mb-2">🎉</div><p>No quick wins found!</p></div>}
                </div>
            )}

            {tab === 'insights' && (
                <div className="space-y-4">
                    {stats.quickWins.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-bold text-[var(--text-main)] mb-3 uppercase tracking-widest text-[10px]">⚡ Fast Tracks ({stats.quickWins.length})</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {stats.quickWins.slice(0,5).map(t=>(
                                    <button key={t.id} className="w-full text-left p-3 rounded-lg btn-high-speed btn-harmonic tab-hierarchy flex justify-between items-center group shadow-sm" onClick={()=>onNavigate(t.classId,t.subjectId,t.id)}>
                                        <span className="text-xs font-bold truncate mr-4">{t.title}</span>
                                        <span className="text-[10px] font-bold opacity-60 group-hover:opacity-100 flex gap-1 whitespace-nowrap">
                                            <span>{t.pendingCount}</span>
                                            <span>items left</span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {stats.zombieTopics.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-bold text-[var(--text-main)] mb-3 uppercase tracking-widest text-[10px]">🧟 Graveyard ({stats.zombieTopics.length})</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {stats.zombieTopics.slice(0,5).map(t=>(
                                    <button key={t.id} className="w-full text-left p-3 rounded-lg btn-high-speed btn-harmonic tab-overdue flex justify-between items-center group shadow-sm" onClick={()=>onNavigate(t.classId,t.subjectId,t.id)}>
                                        <span className="text-xs font-bold truncate mr-4">{t.title}</span>
                                        <span className="text-[10px] font-bold opacity-60 group-hover:opacity-100 flex gap-1 whitespace-nowrap">
                                            <span>{t.ageInDays}</span>
                                            <span>days inactive</span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {tab === 'topics' && (
                <div className="space-y-4">
                    <input type="text" placeholder="Search topics..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border-2 border-[#262624] rounded-lg text-sm outline-none bg-[#ffffff80] text-[#262624] font-bold" />
                    {filteredTopics.length > 0 ? (
                        <VirtualScrollList items={filteredTopics} itemHeight={52} className="border-2 border-[#262624] rounded-lg h-[60vh] min-h-[400px]" renderItem={(topic) => (
                            <button key={topic.id} onClick={() => onNavigate(topic.classId, topic.subjectId, topic.id)} className={`flex justify-between items-center w-full p-3 border-b border-[#262624] btn-high-speed btn-data text-left ${topic.isOverdue ? 'border-l-4 border-l-[#A05344]' : ''}`}>
                                <div className="flex-1 px-2"><div className="font-bold text-sm">{topic.title}</div><div className="text-[10px] opacity-70 uppercase font-bold">{topic.className} → {topic.subjectName}</div></div>
                                <div className="w-24 text-right px-2 text-sm font-bold">{topic.completion}%</div>
                            </button>
                        )} />
                    ) : <div className="text-center py-12 text-[var(--text-muted)] italic">No topics found.</div>}
                </div>
            )}

            {tab === 'classes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                    {hierarchicalStats.classStats.map(c=>(
                        <button key={c.id} className="p-6 rounded-2xl btn-high-speed btn-harmonic tab-hierarchy text-left group shadow-xl border-2 border-[#262624]" onClick={()=>onNavigate(c.id)}>
                            <div className="flex justify-between items-start mb-5">
                                <div className="font-bold uppercase tracking-tighter text-xl group-hover:text-inherit">{c.name}</div>
                                <span className="text-[10px] font-bold uppercase bg-black/20 px-3 py-1 rounded-full">{c.topicCount} Topics</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-2 bg-[var(--bg-app)]/30 rounded-full overflow-hidden shadow-inner border border-black/10">
                                    <div className="h-full bg-current transition-all duration-500" style={{width: `${c.completion}%`}}></div>
                                </div>
                                <span className="font-bold text-sm min-w-[40px] text-right">{c.completion}%</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {tab === 'subjects' && (
                <div className="space-y-3">
                    {stats.subjectDetails.map((subj, idx) => (
                        <button key={idx} onClick={() => onNavigate(subj.classId, subj.id)} className="w-full rounded-xl p-4 btn-high-speed btn-harmonic tab-hierarchy text-left group shadow-md">
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <div className="font-bold uppercase tracking-tighter group-hover:text-inherit">{subj.name}</div>
                                    <div className="text-[10px] font-bold uppercase opacity-70">{subj.className} • {subj.topicCount} topics</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold">{subj.completion}%</div>
                                </div>
                            </div>
                            <div className="h-2 bg-[var(--bg-app)]/30 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-current" style={{width: `${subj.completion}%`}}></div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {tab === 'zombies' && (
                <div className="space-y-4">
                    <div className="rounded-2xl p-6 bg-[#C2C0B6] border-2 border-[#262624] shadow-md">
                        <h2 className="text-xl font-bold text-[#262624] mb-4 uppercase tracking-tight">🧟 Stale Content</h2>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <button onClick={() => { const first = stats.zombieTopics.find(z => z.ageCategory === 'Ancient'); if (first) onNavigate(first.classId, first.subjectId, first.id); }}
                                    className="rounded-xl p-3 text-center btn-high-speed btn-nav shadow-md group">
                                <div className="text-2xl font-bold">{stats.zombieSummary.ancient}</div>
                                <div className="text-[10px] font-bold uppercase mt-1">Ancient</div>
                            </button>
                            <button onClick={() => { const first = stats.zombieTopics.find(z => z.ageCategory === 'Old'); if (first) onNavigate(first.classId, first.subjectId, first.id); }}
                                    className="rounded-xl p-3 text-center btn-high-speed btn-nav shadow-md group">
                                <div className="text-2xl font-bold">{stats.zombieSummary.old}</div>
                                <div className="text-[10px] font-bold uppercase mt-1">Old</div>
                            </button>
                            <button onClick={() => { const first = stats.zombieTopics.find(z => z.ageCategory === 'Stale'); if (first) onNavigate(first.classId, first.subjectId, first.id); }}
                                    className="rounded-xl p-3 text-center btn-high-speed btn-nav shadow-md group">
                                <div className="text-2xl font-bold">{stats.zombieSummary.stale}</div>
                                <div className="text-[10px] font-bold uppercase mt-1">Stale</div>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <button onClick={()=>archiveZombies('Ancient')} className="py-2.5 btn-high-speed btn-danger font-bold rounded-lg text-[10px] uppercase tracking-widest shadow-sm">Purge Ancient</button>
                            <button onClick={()=>archiveZombies('Old')} className="py-2.5 btn-high-speed btn-danger font-bold rounded-lg text-[10px] uppercase tracking-widest shadow-sm">Purge Old</button>
                            <button onClick={()=>archiveZombies('Stale')} className="py-2.5 btn-high-speed btn-danger font-bold rounded-lg text-[10px] uppercase tracking-widest shadow-sm">Purge Stale</button>
                        </div>
                    </div>
                    <div className="space-y-4 pb-6">
                        {stats.zombieTopics.map((topic, idx) => (
                            <button key={idx} onClick={() => onNavigate(topic.classId, topic.subjectId, topic.id)} className="w-full rounded-2xl p-5 btn-high-speed btn-harmonic tab-hierarchy text-left group flex justify-between items-center shadow-lg border-2 border-[#262624]">
                                <div className="flex items-center gap-6">
                                    <span className="text-4xl grayscale group-hover:grayscale-0 transition-all transform group-hover:scale-110">👻</span>
                                    <div>
                                        <div className="font-bold text-base tracking-tight mb-1 group-hover:text-inherit">{topic.title}</div>
                                        <div className="text-[10px] font-bold uppercase opacity-70 tracking-widest">{topic.className} • {topic.subjectName}</div>
                                    </div>
                                </div>
                                <div className="text-right border-l border-black/20 pl-6">
                                    <div className="text-2xl font-bold leading-none">{topic.ageInDays}</div>
                                    <div className="text-[9px] font-bold uppercase opacity-60 mt-1">Days Old</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'overdue' && (
                <div className="space-y-3">
                    {stats.overdueTopics.map(t=>(
                        <button key={t.topicId} onClick={()=>onNavigate(t.classId,t.subjectId,t.topicId)} className="w-full p-4 rounded-xl text-left btn-high-speed btn-danger transition-all group flex justify-between items-center shadow-lg">
                            <div>
                                <div className="font-bold uppercase tracking-tight group-hover:scale-[1.02] transition-transform">{t.topicTitle}</div>
                                <div className="text-[10px] font-bold opacity-70 uppercase mt-1">{t.className} → {t.subjectName} • {t.completion}% complete</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-bold bg-black/20 px-2 py-1 rounded shadow-sm">{t.dueDate}</div>
                                <div className="text-[8px] font-bold uppercase mt-1">Deadline</div>
                            </div>
                        </button>
                    ))}
                    {stats.overdueTopics.length === 0 && <div className="text-center py-12 text-[var(--text-muted)] font-bold italic uppercase tracking-widest">No Overdue Tasks</div>}
                </div>
            )}

            {tab === 'health' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-[var(--text-main)]">System Health</h2>
                        <button 
                            onClick={runDiagnostics} 
                            disabled={running}
                            className={`text-xs px-4 py-1.5 btn-high-speed btn-manage rounded-lg shadow-sm ${running ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {running ? 'Checking...' : 'Re-run Check'}
                        </button>
                    </div>
                    <div className="bg-[var(--bg-app)] rounded-lg p-4 font-mono text-xs overflow-y-auto h-[60vh] space-y-1 shadow-inner border border-[var(--border-subtle)] text-left cp-scroll">
                        {healthLogs.map(log => (
                            <div key={log.id} className={`${log.type === 'header' ? 'text-[var(--text-accent)] font-bold mt-3 mb-1 underline' : log.type === 'success' ? 'text-[var(--status-done-text)]' : log.type === 'error' ? 'text-[var(--status-low-text)] font-bold' : 'text-[var(--text-main)]'}`}>
                                {log.msg}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
    );
};