import { computeEnhancedStats } from './logic';

export const TestRunner = {
    assert: (condition, msg) => { if (!condition) throw new Error(msg); },
    runAll: async (state) => {
        const logs = []; 
        const log = (m, t='info') => logs.push({
            msg: m, 
            type: t, 
            id: Math.random().toString(36).substr(2, 9),
            time: new Date().toLocaleTimeString()
        });

        try {
            log("Initializing System Diagnostics...", 'header');
            
            // 1. Data Integrity
            if (!state) throw new Error("State is null");
            TestRunner.assert(Array.isArray(state.classes), "'classes' must be an array");
            
            const allTopics = state.classes.flatMap(c => c.subjects.flatMap(s => s.topics));
            const allItems = allTopics.flatMap(t => t.items);
            
            log(`Found ${state.classes.length} classes, ${allTopics.length} topics, ${allItems.length} items.`, 'info');

            const missingTopicIds = allTopics.filter(t => !t.id);
            if (missingTopicIds.length > 0) log(`Warning: ${missingTopicIds.length} topics missing IDs`, 'error');
            else log("✓ All topics have valid IDs", 'success');

            const missingCreatedAt = allTopics.filter(t => !t.createdAt);
            if (missingCreatedAt.length > 0) log(`Warning: ${missingCreatedAt.length} topics missing 'createdAt'`, 'error');
            else log("✓ All topics have timestamps", 'success');

            // 2. Intelligence Systems
            log("Auditing Analytics Engine...", 'header');
            const stats = computeEnhancedStats(state.classes);
            TestRunner.assert(stats.quickWins !== undefined, "Analytics system unreachable");
            log(`Velocity: ${stats.overallCompletion}% completion across fleet.`, 'info');
            log(`Intelligence: Detected ${stats.quickWins.length} Quick Wins and ${stats.zombieTopics.length} Zombie topics.`, 'info');

            // 3. Performance Check
            log("System Performance Heuristics...", 'header');
            const start = performance.now();
            computeEnhancedStats(state.classes);
            const end = performance.now();
            const duration = (end - start).toFixed(2);
            log(`Stats calculation took ${duration}ms`, duration > 50 ? 'error' : 'success');

            if (allItems.length > 1000) log("High payload detected. Virtual scrolling handles this, but keep an eye on memory.", 'info');

            log("System Check Complete ✅", 'success');
        } catch (e) { 
            log(`FATAL ERROR: ${e.message}`, 'error'); 
        }
        return logs;
    }
};