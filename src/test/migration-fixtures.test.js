import { describe, it, expect } from 'vitest';
import { DataImportService } from '../utils/data';
import { DATA_VERSION, TEMPLATE_VERSION } from '../constants';
import { migrationFixtures } from './fixtures/migrationFixtures';

describe('Migration fixtures across historical versions', () => {
    Object.entries(migrationFixtures).forEach(([name, fixture]) => {
        it(`migrates ${name} to current schema`, () => {
            const migrated = DataImportService.migrateData(fixture);

            expect(migrated.version).toBe(DATA_VERSION);
            expect(migrated.templateVersion).toBe(TEMPLATE_VERSION);
            expect(Array.isArray(migrated.classes)).toBe(true);
            expect(migrated.classes.length).toBeGreaterThan(0);
            expect(typeof migrated.classes[0].id).toBe('string');
            expect(typeof migrated.classes[0].subjects[0].id).toBe('string');
            expect(typeof migrated.classes[0].subjects[0].topics[0].id).toBe('string');
            expect(typeof migrated.classes[0].subjects[0].topics[0].items[0].id).toBe('string');
            expect(Array.isArray(migrated.template)).toBe(true);
            expect(Array.isArray(migrated.quickInbox)).toBe(true);
        });
    });
});
