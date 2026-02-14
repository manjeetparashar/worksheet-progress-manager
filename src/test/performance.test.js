import { describe, it, expect } from 'vitest';
import { computeEnhancedStats, buildClassesForView } from '../utils/logic';
import { VIEW_MODES } from '../constants';

const makeDataset = ({ classes = 10, subjectsPerClass = 5, topicsPerSubject = 10, itemsPerTopic = 10 }) => {
    let topicCounter = 0;
    let itemCounter = 0;
    return Array.from({ length: classes }, (_, cIdx) => ({
        id: `c-${cIdx}`,
        name: `Class ${cIdx}`,
        archived: false,
        collapsed: false,
        subjects: Array.from({ length: subjectsPerClass }, (_, sIdx) => ({
            id: `s-${cIdx}-${sIdx}`,
            name: `Subject ${sIdx}`,
            collapsed: false,
            topics: Array.from({ length: topicsPerSubject }, (_, tIdx) => {
                topicCounter += 1;
                return {
                    id: `t-${topicCounter}`,
                    title: `Topic ${tIdx}`,
                    items: Array.from({ length: itemsPerTopic }, (_, iIdx) => {
                        itemCounter += 1;
                        return {
                            id: `i-${itemCounter}`,
                            label: `Item ${iIdx}`,
                            checked: iIdx % 3 === 0,
                            checkedAt: iIdx % 3 === 0 ? new Date().toISOString() : null,
                            createdAt: new Date().toISOString()
                        };
                    }),
                    notes: '',
                    priority: tIdx % 2 === 0 ? 'High' : 'Medium',
                    dueDate: '',
                    collapsed: false,
                    createdAt: new Date().toISOString()
                };
            })
        }))
    }));
};

describe('Performance Benchmarks', () => {
    it('computeEnhancedStats stays within budget at 10k items', () => {
        const classes = makeDataset({ classes: 10, subjectsPerClass: 5, topicsPerSubject: 10, itemsPerTopic: 20 }); // 10,000 items
        const start = performance.now();
        const stats = computeEnhancedStats(classes);
        const duration = performance.now() - start;

        expect(stats.totalItems).toBe(10000);
        expect(duration).toBeLessThan(750);
    });

    it('buildClassesForView stays within budget at 10k items', () => {
        const classes = makeDataset({ classes: 10, subjectsPerClass: 5, topicsPerSubject: 10, itemsPerTopic: 20 }); // 10,000 items
        const filters = new Set();
        const start = performance.now();
        const result = buildClassesForView(classes, VIEW_MODES.TODAY, filters);
        const duration = performance.now() - start;

        expect(Array.isArray(result)).toBe(true);
        expect(duration).toBeLessThan(900);
    });
});
