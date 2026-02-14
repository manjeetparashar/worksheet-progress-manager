# Performance Baseline Workflow

1. Run synthetic budgets:
`npm run perf:budget`

2. Record machine-readable perf test output:
`npm run perf:record`

3. Capture Chrome DevTools traces for:
- cold start
- hot navigation (`Alt+1..6` flow)
- sidebar scale filtering

4. Update `perf/chrome-devtools-baseline.json` with measured values.

5. Before/after each major refactor, compare against `budgets` in the baseline file and log deltas in `changelog.md`.

6. Run tests; `src/test/devtoolsBaseline.test.js` enforces baseline JSON budget guards for:
- hot navigation (`viewSwitchP95MsMax`, `longTasksCountMax`)
- sidebar scale (`filterResponseP95MsMax`, `fpsMinMin`)

## Instrumented Trace Mode

Enable:
`localStorage.setItem('ws_perf_trace', 'true')`

Disable:
`localStorage.setItem('ws_perf_trace', 'false')`

With trace mode enabled, console logs will include compute timings for:
- `app.view.buildClassesForView`
- `app.view.classesForMain`
- `command.actions.build`
- `sidebar.filter.sidebarClasses`
- `sidebar.filter.sidebarRows`

Aggregated stats are available at:
`window.__wsPerfTraceStats`
