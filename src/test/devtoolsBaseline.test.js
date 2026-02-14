import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baselinePath = path.resolve(__dirname, '../../perf/chrome-devtools-baseline.json');
const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));

const getProfileMetrics = (name) => {
    const profile = baseline.profiles.find((p) => p.name === name);
    return profile?.metrics || null;
};

describe('DevTools Baseline Guards', () => {
    it('hot navigation metrics stay within configured budget', () => {
        const hotNav = getProfileMetrics('hot_navigation');
        expect(hotNav).toBeTruthy();
        expect(Number.isFinite(hotNav.viewSwitchP95Ms)).toBe(true);
        expect(Number.isFinite(hotNav.longTasksCount)).toBe(true);

        expect(hotNav.viewSwitchP95Ms).toBeLessThanOrEqual(baseline.budgets.viewSwitchP95MsMax);
        expect(hotNav.longTasksCount).toBeLessThanOrEqual(baseline.budgets.longTasksCountMax);
    });

    it('sidebar scale metrics stay within configured budget', () => {
        const sidebar = getProfileMetrics('sidebar_scale');
        expect(sidebar).toBeTruthy();
        expect(Number.isFinite(sidebar.filterResponseP95Ms)).toBe(true);
        expect(Number.isFinite(sidebar.fpsMin)).toBe(true);

        expect(sidebar.filterResponseP95Ms).toBeLessThanOrEqual(baseline.budgets.filterResponseP95MsMax);
        expect(sidebar.fpsMin).toBeGreaterThanOrEqual(baseline.budgets.fpsMinMin);
    });
});
