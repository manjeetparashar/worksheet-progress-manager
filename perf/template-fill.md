# Chrome DevTools Metric Fill Checklist

Use this after any major refactor or before a release snapshot.

## 1. Setup

1. Start app:
`npm run dev`
2. Open in Chrome.
3. Open DevTools:
`F12` -> `Performance` tab.
4. In Performance settings:
- Enable screenshots.
- Keep CPU throttling off for baseline (or use fixed throttle consistently).
- Close unrelated tabs/apps.

## 2. Fill `cold_start.metrics`

Scenario: hard reload app to first usable state.

1. In Performance panel, click Record.
2. Hard reload page (`Ctrl+Shift+R`).
3. Wait until app is interactive, then stop recording.
4. Fill:
- `domContentLoadedMs`: from Timings marker `DOMContentLoaded`.
- `loadEventMs`: from Timings marker `Load`.
- `firstInputDelayMs`: first input event delay (Event timing / Interaction track).
- `scriptEvalMs`: total JS evaluation/scripting time during startup window.

## 3. Fill `hot_navigation.metrics`

Scenario: keyboard switch views repeatedly.

1. Start recording.
2. Run sequence 20+ times:
- `Alt+1` -> `Alt+2` -> `Alt+4` -> `Alt+6` (repeat).
3. Stop recording.
4. Fill:
- `viewSwitchP95Ms`: p95 duration from keydown to visible view completion.
- `longTasksCount`: number of main-thread tasks > 50ms in this recording.

## 4. Fill `sidebar_scale.metrics`

Scenario: large hierarchy filter/expand/scroll.

1. Ensure dataset is large (deep class/subject/topic tree).
2. Start recording.
3. In contextual sidebar:
- Type several filters quickly.
- Expand/collapse branches.
- Scroll rapidly.
4. Stop recording.
5. Fill:
- `filterResponseP95Ms`: p95 keydown-to-updated-list time.
- `fpsMin`: minimum FPS observed during interaction.

## 5. Write values into baseline

File:
`perf/chrome-devtools-baseline.json`

Update:
1. `capturedAt`
2. All `metrics` fields
3. Keep `budgets` unchanged unless you intentionally revise policy.

## 6. Validation

1. Run:
`npm run perf:budget`
2. Run:
`npm run perf:record`
3. Commit updated:
- `perf/chrome-devtools-baseline.json`
- `perf/vitest-perf-latest.json` (optional if you track generated report)
- `changelog.md` with before/after notes
