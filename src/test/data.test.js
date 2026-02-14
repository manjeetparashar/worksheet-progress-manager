import { describe, it, expect } from 'vitest';
import { DataImportService } from '../utils/data';
import { DATA_VERSION, TEMPLATE_VERSION } from '../constants';

describe('DataImportService.migrateData', () => {
    it('normalizes legacy/partial structures into current schema', () => {
        const legacy = {
            classes: [
                {
                    name: 'Class A',
                    subjects: [
                        {
                            name: 'Physics',
                            topics: [
                                {
                                    title: 'Motion',
                                    items: [{ label: 'Worksheet 1', checked: true }]
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        const migrated = DataImportService.migrateData(legacy);
        expect(migrated.version).toBe(DATA_VERSION);
        expect(migrated.templateVersion).toBe(TEMPLATE_VERSION);
        expect(migrated.classes[0].id).toBeTruthy();
        expect(migrated.classes[0].subjects[0].topics[0].items[0].checked).toBe(true);
        expect(Array.isArray(migrated.template)).toBe(true);
        expect(Array.isArray(migrated.quickInbox)).toBe(true);
    });

    it('produces compatibility report for dry-run import checks', () => {
        const payload = {
            version: 48,
            classes: [
                {
                    subjects: [
                        {
                            topics: [
                                { items: [{}, {}] }
                            ]
                        }
                    ]
                }
            ]
        };
        const report = DataImportService.compatibilityReport(payload);
        expect(report.sourceVersion).toBe(48);
        expect(report.targetVersion).toBe(DATA_VERSION);
        expect(report.classes).toBe(1);
        expect(report.subjects).toBe(1);
        expect(report.topics).toBe(1);
        expect(report.items).toBe(2);
        expect(Array.isArray(report.warnings)).toBe(true);
    });
});
