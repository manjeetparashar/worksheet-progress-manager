import { describe, it, expect } from 'vitest';
import { calculateProgress, classifyTopic, detectQuickWins, getNextPendingTarget } from '../utils/logic';

describe('Core Logic Utilities', () => {
    describe('calculateProgress', () => {
        it('calculates 0% for empty items', () => {
            const result = calculateProgress([]);
            expect(result.percent).toBe(0);
            expect(result.total).toBe(0);
        });

        it('calculates 50% correctly', () => {
            const items = [
                { checked: true },
                { checked: false }
            ];
            const result = calculateProgress(items);
            expect(result.percent).toBe(50);
            expect(result.done).toBe(1);
        });

        it('handles all items checked', () => {
            const items = [{ checked: true }, { checked: true }];
            const result = calculateProgress(items);
            expect(result.percent).toBe(100);
        });
    });

    describe('classifyTopic', () => {
        const now = Date.now();
        const stallCutoff = now - (7 * 86400000);

        it('classifies as NotStarted if no items are checked', () => {
            const topic = { items: [{ checked: false }] };
            expect(classifyTopic(topic, now, stallCutoff)).toBe('NotStarted');
        });

        it('classifies as Complete if all items are checked', () => {
            const topic = { items: [{ checked: true }] };
            expect(classifyTopic(topic, now, stallCutoff)).toBe('Complete');
        });

        it('classifies as InProgress if some items checked recently', () => {
            const topic = { 
                items: [
                    { checked: true, checkedAt: new Date(now - 1000).toISOString() },
                    { checked: false }
                ] 
            };
            expect(classifyTopic(topic, now, stallCutoff)).toBe('InProgress');
        });

        it('classifies as Stalled if last activity was long ago', () => {
            const topic = { 
                items: [
                    { checked: true, checkedAt: new Date(now - (10 * 86400000)).toISOString() },
                    { checked: false }
                ] 
            };
            expect(classifyTopic(topic, now, stallCutoff)).toBe('Stalled');
        });
    });

    describe('detectQuickWins', () => {
        it('identifies topics near completion', () => {
            const topics = [
                { 
                    id: '1', 
                    title: 'Near Done', 
                    items: Array(10).fill(0).map((_, i) => ({ checked: i < 9 })) 
                },
                { 
                    id: '2', 
                    title: 'Just Started', 
                    items: [{ checked: false }] 
                }
            ];
            const wins = detectQuickWins(topics);
            expect(wins).toHaveLength(1);
            expect(wins[0].title).toBe('Near Done');
        });
    });

    describe('getNextPendingTarget', () => {
        const classes = [
            {
                id: 'class-1',
                archived: false,
                subjects: [
                    {
                        id: 'subject-1',
                        topics: [
                            {
                                id: 'topic-1',
                                items: [
                                    { id: 'item-1', checked: false },
                                    { id: 'item-2', checked: false }
                                ]
                            }
                        ]
                    }
                ]
            }
        ];

        it('returns first pending item when no current item is focused', () => {
            const target = getNextPendingTarget(classes, null);
            expect(target.itemId).toBe('item-1');
            expect(target.classId).toBe('class-1');
        });

        it('returns next pending item and wraps around', () => {
            const next = getNextPendingTarget(classes, 'item-1');
            expect(next.itemId).toBe('item-2');

            const wrapped = getNextPendingTarget(classes, 'item-2');
            expect(wrapped.itemId).toBe('item-1');
        });
    });
});
