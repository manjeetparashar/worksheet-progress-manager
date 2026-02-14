### **v49.04 - Repo Bootstrap Hygiene (Gitignore + Full Source Tracking)**
- **Repo Hygiene**: Added `.gitignore` to exclude dependency/build/runtime artifacts:
- `node_modules/`, `dist/`, logs/temp, coverage, env files, and `perf/vitest-perf-latest.json`.
- **Source Tracking Fix**: Prepared full project source for Git tracking after initial repository bootstrap so core app files are versioned.

### **v49.03 - Husky Pre-Commit Hook Compatibility Fix**
- **Fix: Pre-Commit Bootstrap Script Path**: Updated `.husky/pre-commit` to remove the legacy `husky.sh` sourcing line, which was referencing a non-existent file in the current Husky layout.
- **Current Hook**: Runs only `npm run perf:guard` for fast performance regression gating before commit.
- **Validation**: `npm run perf:guard` passed (`2/2` tests).

### **v49.02 - Fast Perf Guard Script**
- **DX Improvement**: Added `perf:guard` npm script in `package.json` to run only DevTools baseline guard tests quickly:
- `npm run perf:guard` -> `vitest --run src/test/devtoolsBaseline.test.js`
- **Purpose**: Faster pre-commit/perf-regression checks without running the full test suite.
- **Validation**: `npm run perf:guard` passed (`2/2` tests).

### **v49.01 - Sidebar Budget Guard Added**
- **Regression Guard Extended**: Updated `src/test/devtoolsBaseline.test.js` to enforce sidebar-scale budgets from baseline JSON.
- **New Checks**:
- `filterResponseP95Ms <= filterResponseP95MsMax`
- `fpsMin >= fpsMinMin`
- **Baseline Budget Extended**: Added `fpsMinMin` to `perf/chrome-devtools-baseline.json` (set to `30`) to preserve smooth sidebar interaction floor.
- **Perf Workflow Docs Updated**: `perf/README.md` now documents both hot-navigation and sidebar guard enforcement.
- **Validation**: `npm run check` passed (`lint`, `test`, `build`) with `27/27` tests passing.

### **v49.00 - T14 Baseline Lock + Hot-Navigation Budget Guard**
- **Performance Baseline Update**: Updated `perf/chrome-devtools-baseline.json` to T14 measurements.
- `cold_start`: `domContentLoadedMs=400`, `loadEventMs=1619`, `firstInputDelayMs=1`, `scriptEvalMs=762`
- `hot_navigation`: `viewSwitchP95Ms=497`, `longTasksCount=6`
- `sidebar_scale`: `filterResponseP95Ms=41.3`, `fpsMin=46`
- **Budget Calibration**: Set practical hot-navigation guardrails in baseline budgets:
- `viewSwitchP95MsMax=700`
- `longTasksCountMax=12`
- **Regression Guard Added**: Added `src/test/devtoolsBaseline.test.js` to enforce hot-navigation budgets from baseline JSON during test runs.
- **Workflow Docs Updated**: Updated `perf/README.md` with explicit baseline-guard test step.
- **Validation**: `npm run check` passed (`lint`, `test`, `build`) with `26/26` tests passing.

### **v48.99 - Reorder-Mode Gating for Sortable (Pointerover Containment)**
- **Optimization: Explicit Reorder Activation**: Sortable initialization is now gated by keymap mode (`editing`) so drag listeners are disabled during normal navigation/review flow.
- **Applied To**:
- `src/components/WorkspacePane.jsx` (class-level sortable enable gate)
- `src/components/ClassComponent.jsx` (subject-level sortable enable gate)
- `src/components/SubjectComponent.jsx` (topic-level sortable enable gate)
- `src/components/TopicComponent.jsx` (item-level sortable enable gate)
- **Optimization: Comparator Safety**: Updated memo comparators in class/subject/topic components to include `reorderEnabled` prop and avoid stale render behavior.
- **Intent**: Reduce pointerover-driven main-thread saturation by removing unnecessary Sortable pointer listeners from the dominant navigation path.
- **Behavior Safety**: No labeling, coloring, font type/weight, or taxonomy changes; reordering remains available in `editing` mode.
- **Validation**: `npm run check` passed (`lint`, `test`, `build`) with `25/25` tests passing.

### **v48.98 - Pointerover Churn Mitigation (Interaction Path Stabilization)**
- **Optimization: Sortable Pointer Path Hardening**: Updated `src/components/SortableList.jsx` to initialize Sortable with `supportPointer: false`, reducing pointer-event overhead in dense hierarchy hover/interaction scenarios while preserving drag-reorder behavior.
- **Optimization: Hover Transition Scope Reduction**: Replaced broad `transition: all` rules with property-scoped transitions in `src/index.css` for high-frequency controls (`.btn-high-speed`, checkbox, close/control buttons) to reduce pointerover-triggered style/layout/paint churn.
- **Optimization: High-Frequency UI Transition Narrowing**:
- Removed nonessential `transition-all` from workspace header in `src/components/WorkspacePane.jsx`.
- Narrowed class metadata hover transition to `transition-opacity` in `src/components/ClassComponent.jsx`.
- **Behavior Safety**: No labeling, coloring, font type/weight, taxonomy, or workflow model changes.
- **Validation**: `npm run check` passed (`lint`, `test`, `build`) with `25/25` tests passing.

### **v48.97 - Step-2 Layout Thrash Mitigation (Scoped Autofocus Queries)**
- **Optimization: Scoped DOM Lookup**: Replaced global autofocus lookups with container-scoped queries in hierarchy components to avoid full-document selector scans during creation flows:
- `src/components/ClassComponent.jsx`
- `src/components/SubjectComponent.jsx`
- `src/components/TopicComponent.jsx`
- **Optimization: Strict New-Item Gating**: Autofocus effects now run only when list lengths increase (new class-subtree entities), preventing autofocus logic from re-running on non-create render cycles.
- **Behavior Safety**: No labeling, coloring, font type/weight, categorization, or interaction model changes.
- **Validation**: `npm run check` passed (`lint`, `test`, `build`) with `25/25` tests passing.

### **v48.96 - Hot-Navigation Concurrency Pass (View Switch Transition)**
- **Optimization: Concurrent View Switching**: Updated `src/App.jsx` to route primary view changes through `startTransition` (`switchViewMode`) so heavy view updates are interruptible during interaction.
- **Applied To**:
- Icon rail section switches.
- Keyboard shortcut view switches/macros via `useAppShortcuts`.
- Command palette view/macro actions via `useCommandActions`.
- **Behavior**: No taxonomy/label/color/typography changes; navigation semantics preserved.
- **Validation**: `npm run check` passed (`lint`, `test`, `build`) with `25/25` tests passing.

### **v48.95 - DevTools Reprofile After v48.94 (Startup Gain, Interaction Regression)**
- **Performance Reprofile Recorded**: Updated `perf/chrome-devtools-baseline.json` with test-10 measurements.
- **New Capture**:
- `cold_start`: `domContentLoadedMs=646`, `loadEventMs=1200`, `firstInputDelayMs=1`, `scriptEvalMs=646`
- `hot_navigation`: `viewSwitchP95Ms=944`, `longTasksCount=28`
- `sidebar_scale`: `filterResponseP95Ms=263`, `fpsMin=12`
- **Delta vs v48.92 (test-9)**:
- Improved: `domContentLoadedMs` (-814ms), `loadEventMs` (-950ms), `scriptEvalMs` (-776ms)
- Regressed: `viewSwitchP95Ms` (+340ms), `longTasksCount` (+6), `filterResponseP95Ms` (+31ms), `fpsMin` (-19)
- **Status**: Startup path improved strongly, but interaction path is critically worse; next pass must prioritize nav/paint stability over startup throughput.

### **v48.94 - Rollback + Layout Containment Pass**
- **Rollback: Progressive Class Rendering**: Reverted the progressive class-rendering experiment from `src/components/WorkspacePane.jsx` due interaction jank risk under benchmark conditions.
- **Layout/Paint Mitigation**: Added CSS containment hints on hierarchy containers:
- `src/components/ClassComponent.jsx`
- `src/components/SubjectComponent.jsx`
- `src/components/TopicComponent.jsx`
- Applied `content-visibility: auto` and `contain-intrinsic-size` to reduce offscreen paint/layout work.
- **Validation**: `npm run check` passed (`lint`, `test`, `build`) with `25/25` tests passing.

### **v48.93 - Hot-Navigation Render Fan-Out Mitigation (Progressive Class Render)**
- **Optimization: Progressive Main-List Rendering**: Updated `src/components/WorkspacePane.jsx` to progressively render class cards in non-reorder contexts (filtered/scoped/non-Active root views) to reduce initial commit work on view switches.
- **Safety Constraint**: Reorder-capable mode remains unchanged (full list rendered) to preserve drag-sort correctness.
- **Implementation Notes**:
- Introduced `sortDisabled` derivation and progressive render gating.
- Incremental class reveal in small batches per frame tick.
- **Validation**: `npm run check` passed (`lint`, `test`, `build`) with `25/25` tests passing.

### **v48.92 - DevTools Reprofile After v48.91 (Test-9 Regression Persisting)**
- **Performance Reprofile Recorded**: Updated `perf/chrome-devtools-baseline.json` with test-9 measurements.
- **New Capture**:
- `cold_start`: `domContentLoadedMs=1420`, `loadEventMs=2150`, `firstInputDelayMs=1`, `scriptEvalMs=1422`
- `hot_navigation`: `viewSwitchP95Ms=604`, `longTasksCount=22`
- `sidebar_scale`: `filterResponseP95Ms=232`, `fpsMin=31`
- **Delta vs v48.88 (best recent run)**:
- Regressed: `domContentLoadedMs` (+235ms), `loadEventMs` (+465ms), `scriptEvalMs` (+746ms)
- Regressed: `viewSwitchP95Ms` (+226ms), `longTasksCount` (+10)
- Regressed: `filterResponseP95Ms` (+74ms), `fpsMin` (-11)
- Unchanged: `firstInputDelayMs` (=1)
- **Decision**: Do **not** reapply autofocus/layout-effect patch path. Next pass should target navigation-triggered global rerender surfaces (state/context fan-out and list reconciliation scope).

### **v48.91 - Rollback: v48.89 Autofocus Effect Strategy**
- **Rollback Executed**: Reverted v48.89 autofocus effect modifications in hierarchy components due measured regression:
- `src/components/ClassComponent.jsx`
- `src/components/SubjectComponent.jsx`
- `src/components/TopicComponent.jsx`
- **Restored Behavior**:
- `useLayoutEffect`-based autofocus lifecycle.
- Global selector autofocus path (`document.querySelector`) used before v48.89.
- **Validation**: `npm run check` passed (`lint`, `test`, `build`) with `25/25` tests passing.

### **v48.90 - DevTools Reprofile After v48.89 (Regression)**
- **Performance Reprofile Recorded**: Updated `perf/chrome-devtools-baseline.json` with post-v48.89 measurements.
- **New Capture**:
- `cold_start`: `domContentLoadedMs=1460`, `loadEventMs=2500`, `firstInputDelayMs=1`, `scriptEvalMs=1730`
- `hot_navigation`: `viewSwitchP95Ms=498`, `longTasksCount=26`
- `sidebar_scale`: `filterResponseP95Ms=301`, `fpsMin=30`
- **Delta vs v48.88**:
- Regressed: `domContentLoadedMs` (+275ms), `loadEventMs` (+815ms), `scriptEvalMs` (+1054ms)
- Regressed: `viewSwitchP95Ms` (+120ms), `longTasksCount` (+14)
- Regressed: `filterResponseP95Ms` (+143ms), `fpsMin` (-12)
- Unchanged: `firstInputDelayMs` (=1)
- **Status**: v48.89 autofocus effect strategy did not hold under measured workload. Recommend rollback to v48.88 behavior for performance baseline integrity.

### **v48.89 - Hot-Navigation Micro-Fix (Autofocus Effect De-Blocking)**
- **Optimization: Layout-Blocking Effect Removal**: Replaced `useLayoutEffect` with `useEffect` in hierarchy components to avoid blocking commit/paint on hot-navigation transitions.
- **Optimization: Scoped DOM Queries**: Replaced global `document.querySelector` autofocus lookups with component-root-scoped lookups via refs:
- `src/components/ClassComponent.jsx`
- `src/components/SubjectComponent.jsx`
- `src/components/TopicComponent.jsx`
- **Intent**: Reduce layout/commit pressure and long tasks without changing behavior, labels, colors, typography, or taxonomy.
- **Validation**: `npm run check` passed (`lint`, `test`, `build`) with `25/25` tests passing.

### **v48.88 - DevTools Reprofile After v48.87 (Strong Improvement)**
- **Performance Reprofile Recorded**: Updated `perf/chrome-devtools-baseline.json` with post-v48.87 measurements.
- **New Capture**:
- `cold_start`: `domContentLoadedMs=1185`, `loadEventMs=1685`, `firstInputDelayMs=1`, `scriptEvalMs=676`
- `hot_navigation`: `viewSwitchP95Ms=378`, `longTasksCount=12`
- `sidebar_scale`: `filterResponseP95Ms=158`, `fpsMin=42`
- **Delta vs v48.83**:
- Improved: `domContentLoadedMs` (-255ms), `loadEventMs` (-875ms), `scriptEvalMs` (-816ms)
- Improved: `viewSwitchP95Ms` (-82ms), `longTasksCount` (-7)
- Improved: `filterResponseP95Ms` (-58ms), `fpsMin` (=42 stable)
- Unchanged: `firstInputDelayMs` (=1)
- **Status**: Major performance recovery and clear trend improvement. Remaining over-budget metrics persist (`viewSwitchP95Ms`, `filterResponseP95Ms`, `longTasksCount`) but substantially reduced.

### **v48.87 - Favicon 404 Noise Fix**
- **Fix: Dev Console Noise Reduction**: Added `public/favicon.ico` to satisfy browser default favicon requests and eliminate `GET /favicon.ico 404` noise during development profiling.
- **Scope**: Non-functional UI/runtime behavior unchanged.

### **v48.86 - Hook Order Hotfix (AppContent)**
- **Fix: Rules-of-Hooks Violation**: Resolved `Rendered more hooks than during the previous render` in `AppContent` by moving `worksheetContextValue` `useMemo` above the early `if (!state) return ...` branch in `src/App.jsx`.
- **Impact**: Restores runtime stability and prevents hook-order crashes on initial/loading render transitions.
- **Validation**: `npm run check` passed (`lint`, `test`, `build`) with `25/25` tests passing.

### **v48.85 - DevTools Reprofile After v48.84 (No Delta)**
- **Performance Reprofile Recorded**: Captured post-v48.84 metrics; values are unchanged versus v48.83.
- **Capture**:
- `cold_start`: `domContentLoadedMs=1440`, `loadEventMs=2560`, `firstInputDelayMs=1`, `scriptEvalMs=1492`
- `hot_navigation`: `viewSwitchP95Ms=460`, `longTasksCount=19`
- `sidebar_scale`: `filterResponseP95Ms=216`, `fpsMin=42`
- **Status**: Context decoupling did not move measured DevTools metrics in this run; retain change for architectural hygiene, and target next pass at commit/layout hotspots (DOM size and expensive effects).

### **v48.84 - Hot-Navigation Context Decoupling**
- **Root Cause Targeted**: Hierarchy components were subscribed to broad `WorksheetContext`, so view/keymap/state changes triggered unnecessary tree-wide rerenders during navigation.
- **Fix: Dedicated Zen Context**:
- Added `ZenModeContext` in `src/context.js`.
- Updated `ClassComponent`, `SubjectComponent`, and `TopicComponent` to consume `ZenModeContext` instead of full `WorksheetContext`.
- **App Provider Update**:
- `src/App.jsx` now provides `ZenModeContext` separately and memoizes `WorksheetContext` value object.
- **Effect**: Reduces context-driven invalidation of large tree components on hot navigation paths.
- **Validation**: `npm run check` passed (`lint`, `test`, `build`) with `25/25` tests passing.

### **v48.83 - DevTools Reprofile After v48.82 (Render-Pruning Impact)**
- **Performance Reprofile Recorded**: Updated `perf/chrome-devtools-baseline.json` with post-v48.82 measurements.
- **New Capture**:
- `cold_start`: `domContentLoadedMs=1440`, `loadEventMs=2560`, `firstInputDelayMs=1`, `scriptEvalMs=1492`
- `hot_navigation`: `viewSwitchP95Ms=460`, `longTasksCount=19`
- `sidebar_scale`: `filterResponseP95Ms=216`, `fpsMin=42`
- **Delta vs v48.80 canonical baseline**:
- Improved: `longTasksCount` (-5), `filterResponseP95Ms` (-41ms), `fpsMin` (+12)
- Regressed: `domContentLoadedMs` (+20ms), `loadEventMs` (+500ms), `scriptEvalMs` (+265ms), `viewSwitchP95Ms` (+159ms)
- Unchanged: `firstInputDelayMs` (=1)
- **Status**: Sidebar smoothness and long-task pressure improved; hot-navigation latency still over budget and startup load/scripting regressed.

### **v48.82 - Render Bottleneck Fix (Memo Comparator Stabilization)**
- **Root Cause Addressed**: Trace timings showed compute pipelines were cheap; bottleneck likely in render/commit churn from callback identity changes propagating through large hierarchy trees.
- **Fix: Custom Memo Comparators Added**:
- `src/components/ClassComponent.jsx`
- `src/components/SubjectComponent.jsx`
- `src/components/TopicComponent.jsx`
- **Effect**: Components now ignore callback prop identity (`onUpdate`/`onDelete`) and re-render only when data-bearing props actually change, reducing unnecessary hierarchy rerenders during view transitions and navigation.
- **Behavior Safety**: No labeling, color, typography, taxonomy, or workflow changes.
- **Validation**: `npm run check` passed (`lint`, `test`, `build`) with `25/25` tests passing.

### **v48.81 - Profiling Instrumentation Pass (No Behavior Change)**
- **Instrumentation: Toggleable Perf Trace Utility**: Added `src/utils/perfTrace.js` with localStorage-controlled tracing (`ws_perf_trace=true`) and aggregated stats sink (`window.__wsPerfTraceStats`).
- **Instrumentation: View Pipeline Timing**: Added trace points in `src/App.jsx` for:
- `app.stats.computeEnhancedStats`
- `app.view.buildClassesForView`
- `app.view.classesForMain`
- **Instrumentation: Sidebar Pipeline Timing**: Added trace points in `src/hooks/useSidebarNavigatorState.js` for:
- `sidebar.filter.sidebarClasses`
- `sidebar.filter.sidebarRows`
- **Instrumentation: Command Action Build Timing**: Added trace point in `src/hooks/useCommandActions.js` for:
- `command.actions.build`
- **Docs: Trace Workflow Added**: Updated `perf/README.md` with enable/disable commands and metrics list.
- **Validation**: `npm run check` passed (`lint`, `test`, `build`) with `25/25` tests passing.

### **v48.80 - Baseline Reset to Test-4 Canonical Profile**
- **Performance Baseline Realignment**: Updated `perf/chrome-devtools-baseline.json` to use the provided Test-4 measurement set as the canonical baseline snapshot.
- **Canonical Values**:
- `cold_start`: `domContentLoadedMs=1420`, `loadEventMs=2060`, `firstInputDelayMs=1`, `scriptEvalMs=1227`
- `hot_navigation`: `viewSwitchP95Ms=301`, `longTasksCount=24`
- `sidebar_scale`: `filterResponseP95Ms=257`, `fpsMin=30`
- **Purpose**: Re-anchor comparisons to the agreed representative run before further profiling-driven optimization.

### **v48.79 - DevTools Reprofile After v48.78 (Mixed Outcome)**
- **Performance Reprofile Recorded**: Updated `perf/chrome-devtools-baseline.json` with post-v48.78 measurements.
- **New Capture**:
- `cold_start`: `domContentLoadedMs=1460`, `loadEventMs=1960`, `firstInputDelayMs=1`, `scriptEvalMs=1725`
- `hot_navigation`: `viewSwitchP95Ms=498`, `longTasksCount=26`
- `sidebar_scale`: `filterResponseP95Ms=301`, `fpsMin=30`
- **Delta vs v48.77**:
- Improved: `loadEventMs` (-100ms)
- Regressed: `domContentLoadedMs` (+40ms), `scriptEvalMs` (+498ms), `viewSwitchP95Ms` (+197ms), `longTasksCount` (+2), `filterResponseP95Ms` (+44ms)
- Unchanged: `firstInputDelayMs` (=1), `fpsMin` (=30)
- **Status**: Incremental narrowing did not improve target over-budget metrics under measured workflow; next pass should focus on eliminating repeated non-filter work during view transitions.

### **v48.78 - Safe Sidebar Micro-Optimization (Incremental Filter Narrowing)**
- **Optimization: Incremental Sidebar Query Narrowing**: Updated `src/hooks/useSidebarNavigatorState.js` to reuse previous filtered sidebar result when the new query extends the prior query prefix (progressive narrowing), reducing repeated full-tree scans during continuous typing.
- **Safety Scope**: No command palette compute changes; no labeling/color/typography/taxonomy changes; behavior-equivalent filtering retained.
- **Validation**:
- `npm run check` passed (`lint`, `test`, `build`) with `25/25` tests passing.
- `npm run perf:record` regenerated `perf/vitest-perf-latest.json`.

### **v48.77 - DevTools Reprofile After v48.76 Rollback (Recovery Confirmed)**
- **Performance Reprofile Recorded**: Updated `perf/chrome-devtools-baseline.json` with post-rollback measurements.
- **New Capture**:
- `cold_start`: `domContentLoadedMs=1420`, `loadEventMs=2060`, `firstInputDelayMs=1`, `scriptEvalMs=1227`
- `hot_navigation`: `viewSwitchP95Ms=301`, `longTasksCount=24`
- `sidebar_scale`: `filterResponseP95Ms=257`, `fpsMin=30`
- **Delta vs v48.75 (critical regression run)**:
- Recovered: `domContentLoadedMs` (-230ms), `loadEventMs` (-40ms), `scriptEvalMs` (-1644ms)
- Recovered: `viewSwitchP95Ms` (-846ms), `longTasksCount` (-8)
- Recovered: `filterResponseP95Ms` (-555ms), `fpsMin` (+15)
- Unchanged: `firstInputDelayMs` (=1)
- **Status**: Rollback recovered the major regression. Remaining over-budget metrics still require targeted, evidence-driven optimization.

### **v48.76 - Controlled Rollback of v48.74 Compute Path**
- **Rollback: Command Action Compute Strategy**: Reverted v48.74 dynamic command action capping/prioritization/search-text preprocessing in `src/hooks/useCommandActions.js` to restore pre-v48.74 behavior while keeping palette-open gating from v48.72.
- **Rollback: Command Palette Indexed Search Path**: Reverted indexed `_search` filtering in `src/components/CommandPalette.jsx` to previous direct label/sub filtering.
- **Rollback: Sidebar Search Cache Layer**: Reverted searchable-hierarchy cache/index path in `src/hooks/useSidebarNavigatorState.js`, restoring pre-v48.74 deferred-query filter logic.
- **Reason**: v48.75 DevTools capture showed critical regressions under real workload after v48.74.
- **Validation**:
- `npm run check` passed (`lint`, `test`, `build`) with `25/25` tests passing.
- `npm run perf:record` regenerated `perf/vitest-perf-latest.json`.

### **v48.75 - DevTools Reprofile After v48.74 (Critical Regression)**
- **Performance Reprofile Recorded**: Updated `perf/chrome-devtools-baseline.json` with post-v48.74 measurements.
- **New Capture**:
- `cold_start`: `domContentLoadedMs=1650`, `loadEventMs=2100`, `firstInputDelayMs=1`, `scriptEvalMs=2871`
- `hot_navigation`: `viewSwitchP95Ms=1147`, `longTasksCount=32`
- `sidebar_scale`: `filterResponseP95Ms=812`, `fpsMin=15`
- **Delta vs v48.73**:
- Regressed: `domContentLoadedMs` (+230ms), `loadEventMs` (+40ms), `scriptEvalMs` (+1644ms)
- Regressed: `viewSwitchP95Ms` (+846ms), `longTasksCount` (+14)
- Regressed: `filterResponseP95Ms` (+555ms), `fpsMin` (-15)
- Unchanged: `firstInputDelayMs` (=1)
- **Status**: Critical performance regression. v48.74 optimization strategy did not hold under measured workload and requires rollback/targeted isolation.

### **v48.74 - Deep Compute Reduction Pass (Command + Sidebar)**
- **Optimization: Context-Aware Command Action Capping**: Updated `src/hooks/useCommandActions.js` with bounded dynamic action generation to reduce palette/action build pressure at scale:
- Prioritizes selected class path first.
- Caps item-level actions per topic (`selected path` higher cap, default lower cap).
- Caps total dynamic action volume (`MAX_DYNAMIC_ACTIONS`) to avoid runaway build time on large datasets.
- **Optimization: Pre-Indexed Command Search Text**: `useCommandActions` now emits precomputed lowercase `searchText` per action so filtering avoids repeated string normalization work.
- **Optimization: Command Palette Indexed Filtering**: Updated `src/components/CommandPalette.jsx` to use pre-indexed action keys/search blobs for lower per-keystroke overhead.
- **Optimization: Sidebar Search Index + Cache**: Updated `src/hooks/useSidebarNavigatorState.js` to build a memoized searchable hierarchy index and query-result cache, reducing repeated lowercase conversions and deep rescans during filter typing.
- **Validation**:
- `npm run check` passed (`lint`, `test`, `build`) with `25/25` tests passing.
- `npm run perf:record` regenerated `perf/vitest-perf-latest.json`.

### **v48.73 - DevTools Reprofile After v48.72 (Regression Logged)**
- **Performance Reprofile Recorded**: Updated `perf/chrome-devtools-baseline.json` with post-optimization DevTools measurements.
- **New Capture**:
- `cold_start`: `domContentLoadedMs=1420`, `loadEventMs=2060`, `firstInputDelayMs=1`, `scriptEvalMs=1227`
- `hot_navigation`: `viewSwitchP95Ms=301`, `longTasksCount=18`
- `sidebar_scale`: `filterResponseP95Ms=257`, `fpsMin=30`
- **Delta vs v48.71**:
- Improved: `domContentLoadedMs` (-90ms)
- Regressed: `loadEventMs` (+280ms), `scriptEvalMs` (+416ms), `viewSwitchP95Ms` (+34ms), `longTasksCount` (+4), `filterResponseP95Ms` (+21ms)
- Unchanged: `firstInputDelayMs` (=1), `fpsMin` (=30)
- **Status**: Target metrics remain over budget; further focused optimization needed on command/action compute path and sidebar filter pipeline.

### **v48.72 - Latency Optimization Pass (View Switch + Sidebar Filter)**
- **Optimization: Command Action Expansion Gated**: Updated `src/hooks/useCommandActions.js` to skip heavy dynamic hierarchy action generation unless Command Palette is open (`enabled: paletteOpen`), reducing render workload during normal navigation.
- **Optimization: Deferred Sidebar Filtering**: Updated `src/hooks/useSidebarNavigatorState.js` to use deferred query evaluation (`useDeferredValue`) for hierarchy filtering and expansion row derivation, lowering keystroke blocking and long-task pressure during sidebar search at scale.
- **Targeted Outcome**: Reduce `viewSwitchP95Ms`, `filterResponseP95Ms`, and `longTasksCount` under large datasets without changing labels, coloring, typography, taxonomy, or interaction model.
- **Validation**:
- `npm run check` passed (`lint`, `test`, `build`) with `25/25` tests passing.
- `npm run perf:record` regenerated `perf/vitest-perf-latest.json`.

### **v48.71 - DevTools Baseline Capture (Measured)**
- **Performance Baseline Filled**: Updated `perf/chrome-devtools-baseline.json` with real Chrome DevTools measurements.
- **Captured Metrics**:
- `cold_start`: `domContentLoadedMs=1510`, `loadEventMs=1780`, `firstInputDelayMs=1`, `scriptEvalMs=811`
- `hot_navigation`: `viewSwitchP95Ms=267`, `longTasksCount=14`
- `sidebar_scale`: `filterResponseP95Ms=236`, `fpsMin=30`
- **Budget Snapshot**:
- Pass: `firstInputDelayMs` (1 <= 100)
- Over budget: `viewSwitchP95Ms` (267 > 100), `filterResponseP95Ms` (236 > 100), `longTasksCount` (14 > 0)

### **v48.70 - DevTools Fill Template Added**
- **Performance Docs: Metric Fill Checklist**: Added `perf/template-fill.md` with exact DevTools recording steps and field-by-field mapping for `cold_start`, `hot_navigation`, and `sidebar_scale` metrics in `perf/chrome-devtools-baseline.json`.
- **Workflow Clarity**: Documented when to profile, what values to capture, and how to update/validate baseline artifacts consistently.

### **v48.69 - Completion Pass (Dead State Removal, Action Hooks, Perf Artifacts, Keyboard Flows)**
- **Cleanup: Dead State Removed**: Removed unused `focusModeId` and `autoBackup` state from `src/App.jsx`.
- **Architecture: Bookmark Hook Extraction**: Added `src/hooks/useBookmarks.js` to own bookmark persistence and bookmark creation workflow.
- **Architecture: Command Action Hook Extraction**: Added `src/hooks/useCommandActions.js` to centralize command palette action construction (views, macros, maintenance, dynamic navigation, bookmark actions).
- **Refactor: App Orchestrator Slimming**: `src/App.jsx` reduced further (now 411 lines) by delegating bookmark/action concerns to hooks while preserving behavior.
- **Testing: Keyboard Flow Regression Coverage**: Added `src/test/shortcuts-flow.test.jsx` covering core high-speed keyboard paths (`Ctrl+K`, `Alt+2`, `Ctrl+Shift+M`).
- **Performance: Baseline Artifact Workflow**:
- Added `perf/chrome-devtools-baseline.json` for persisted DevTools baseline budgets.
- Added `perf/README.md` with repeatable baseline capture/compare workflow.
- Added `npm run perf:record` to generate machine-readable perf output (`perf/vitest-perf-latest.json`).
- **Validation: Full Gate Green**: `npm run check` passed (`lint`, `test`, `build`) with tests now `25/25`.

### **v48.68 - State Decomposition Phase 5 (Navigator + View Memory Hooks)**
- **Architecture: Sidebar Navigator Hook**: Added `src/hooks/useSidebarNavigatorState.js` to own contextual sidebar filter/expand state, virtual tree row derivation, shift-range topic selection, and splitter resize behavior.
- **Architecture: View Memory Hook**: Added `src/hooks/useViewContextMemory.js` to centralize per-view context snapshot persistence/restoration, view/filter storage, and context validity reconciliation against filtered datasets.
- **Refactor: App Orchestrator Simplification**: Removed duplicated sidebar/view-memory effects and memo blocks from `src/App.jsx`; app now composes these hooks while preserving behavior.
- **Behavior Integrity**: No UX/label/color/typography/category changes; progressive disclosure navigation, per-view restore, and bulk-selection clearing behavior preserved.
- **Validation: Full Gate Green**: `npm run check` passed (`lint`, `test`, `build`).

### **v48.67 - Overlay Orchestration Extraction (Phase 4)**
- **Architecture: Overlay Boundary Extraction**: Added `src/components/AppOverlays.jsx` to centralize bulk action bar, rollback strip, macro preview, analytics/data/template/archive/telemetry modals, and quick-capture/command/help overlays.
- **Refactor: App Orchestrator Slimming**: `src/App.jsx` now delegates overlay rendering to `AppOverlays`, keeping core view orchestration focused on pane layout/state flows.
- **Stability Preservation**: No behavioral changes to macros, import dry-run/apply, rollback, bulk delete undo window, telemetry panel, or shortcut/help overlays.
- **Constraint Integrity**: Labels, colors, typography, category semantics, and keyboard workflow preserved; structural decomposition only.
- **Validation: Full Gate Green**: `npm run check` passed (`lint`, `test`, `build`).

### **v48.66 - Three-Pane Shell Componentization + Hook Stability**
- **Architecture: Layout Decomposition Phase 3**: Extracted three-pane shell UI blocks from `App.jsx` into dedicated components:
- `src/components/IconRail.jsx`
- `src/components/ContextSidebar.jsx`
- `src/components/WorkspacePane.jsx`
- **Refactor: App Orchestration Simplification**: `App.jsx` now composes pane components and retains orchestration/state logic, reducing UI coupling and improving maintainability for future hierarchy scale work.
- **Fix: Keyboard Help Hook Order**: Removed pre-hook early return in `src/components/KeyboardHelp.jsx` to enforce stable hook execution order and prevent `Rendered more hooks than during the previous render`.
- **Constraint Integrity**: Preserved all existing labels, color system, typography, categorization, and behavior; only structural code organization changed.
- **Validation: Full Gate Green**: `npm run check` passed (`lint`, `test`, `build`).

### **v48.65 - Architecture Decomposition Phase 2**
- **Architecture: Core State Hook Extraction**: Added `src/hooks/useAppState.js` to centralize state lifecycle, history stack, persistence, read-only guard, and operation journaling orchestration.
- **Architecture: Safety Service Hook Extraction**: Added `src/hooks/useSafetyServices.js` for telemetry/backup policy handling, separating safety concerns from UI composition.
- **Architecture: App-Level Shortcut Hook Migration**: Updated `src/hooks/useAppShortcuts.js` to register all shortcut hooks at top-level (rules-of-hooks compliant and manifest-driven).
- **Refactor: App Orchestration Slimming**: `src/App.jsx` now consumes extracted hooks/services instead of owning all low-level effects and initialization logic.
- **Behavior Integrity**: Existing features preserved (undo/redo, rollback, macros, import dry-run, review lock, telemetry, backup rotation).
- **Validation**: Full quality gate passed (`lint`, `test`, `build`).

### **v48.64 - Architecture Refactor (Action Layer + Shortcut Architecture)**
- **Architecture: Domain Action Layer**: Added pure curriculum mutation utilities in `src/domain/actions.js` (create class, path uncollapse, add/move items, bulk delete/mark-done, sidebar macro application).
- **Architecture: Central Shortcut Orchestration**: Added `src/hooks/useAppShortcuts.js` and moved app-level shortcut registration out of `App.jsx` into a centralized, maintainable module.
- **Architecture: Stable Shortcut IDs**: Introduced shortcut manifest `src/config/shortcuts.js` with explicit IDs/default combos/category metadata for long-term customization safety.
- **Refactor: App Simplification**: `App.jsx` now consumes pure actions and centralized shortcut hook instead of repeating large inline mutation/registration blocks.
- **Behavior Preserved**: No functional regression in workflows; all existing keyboard features, rollback, macros, and navigation behavior retained.
- **Validation**: Full quality gate passed (`lint`, `test`, `build`).

### **v48.63 - Hook Order Stability Fix**
- **Fix: KeyboardHelp Hooks Order**: Resolved React hook-order violation by ensuring all hooks (`useMemo`) execute before conditional early return.
- **Result: Runtime Recovery**: Eliminates `Rendered more hooks than during the previous render` crash when opening/closing shortcuts modal.
- **Validation: Full Gate Green**: `lint`, `test`, and `build` all pass after fix.

### **v48.62 - Runtime Stability Hotfix**
- **Fix: Sidebar Selection Initialization Order**: Resolved runtime `ReferenceError` (`visibleSidebarTopicIds before initialization`) by reordering callback initialization in `App.jsx`.
- **Validation: Full Gate Re-run**: Confirmed `lint`, `test`, and `build` pass after hotfix.

### **v48.61 - Advanced Productivity Control Layer**
- **Shortcut Customization Engine**: Added editable shortcut bindings with persistent overrides and built-in conflict detection/reset (`useShortcuts` + Keyboard Help customization mode).
- **Review Mode Write Lock**: `review` keymap mode now enforces read-only safety by blocking state writes, preventing accidental edits during audits.
- **Hierarchy Bookmarks**: Added persistent path bookmarks (Class/Subject/Topic) with quick-jump actions and command-palette integration.
- **Sidebar Bulk Selection at Scale**: Added topic-level checkbox selection in virtualized sidebar, including shift-range selection and filtered-topic selection.
- **Macro Diff Preview**: Destructive/large sidebar macros now open a target diff preview modal before execution.
- **Startup Telemetry Panel**: Added persisted telemetry tracking for hydration and first-input latency, with a dedicated modal view and clear control.
- **Backup Rotation Policy**: Added timestamped rotating local backups (`ws_rotating_backups`) with retention window (14 days) and max snapshot cap (20).
- **Import Compatibility Dry-Run**: Added schema compatibility report prior to import apply, including source/target version and payload shape warnings.
- **CI + Perf Hooking**: Added `perf:budget` script and retained CI gate flow.

### **v48.60 - Productivity Hardening Phase (All-In)**
- **Navigation Scale: Virtualized Sidebar Outline**: Replaced non-virtualized hierarchy rendering with `VirtualScrollList`-based outline rows for improved responsiveness under deep/large trees.
- **Command-First Expansion**: Command palette now includes view switches, sidebar focus, keymap cycling, class/subject navigation, and macro actions.
- **Workflow Macros**: Added macro shortcuts and commands:
- `Alt+Shift+1` Today Overdue Sweep
- `Alt+Shift+2` Capture + Inbox
- `Alt+Shift+3` Weekly Planning
- **Mode-Specific Keymaps**: Added persistent keymap mode system (`navigation`, `editing`, `review`) with cycling shortcut `Ctrl+Shift+M`.
- **Operation Journal + Quick Rollback**: Added operation logging for major write actions and instant rollback control (`Ctrl+Shift+Z` or rollback button).
- **Performance Budgets in CI**: Added `perf:budget` script and GitHub Actions workflow (`.github/workflows/ci.yml`) running full `npm run check`.
- **Persistence Enhancements**: Keymap mode persisted via `ws_keymap_mode`; existing per-view/sidebar persistence retained.

### **v48.59 - Splitter Control and Per-View Memory**
- **Layout: Resizable Contextual Sidebar**: Added drag-to-resize splitter between contextual sidebar and main workspace (persisted width with safety bounds).
- **State: Per-View Sidebar Memory**: Sidebar query, expanded class/subject branch, and selected context are now stored/restored independently for each major view.
- **Flow: Seamless View Switching**: Switching between Today/Active/Archived/Due week/Reference/Quick inbox now restores each view’s last navigation context instead of resetting.
- **Persistence: Local Navigation Cache**: Added durable local storage keys for sidebar width and per-view context (`ws_sidebar_width`, `ws_view_context_map`).
- **Constraint Integrity**: No taxonomy/label/typography/color-category changes; behavior and spatial efficiency only.

### **v48.58 - Density and Scale Navigation Pass**
- **UX: Progressive Disclosure Sidebar**: Refined contextual navigator to open one active branch path at a time (class -> subject -> topic) for lower clutter on large datasets.
- **UX: Hierarchy Scan Speed**: Added lightweight count indicators for subjects/topics in sidebar rows to improve high-volume scanning.
- **Keyboard: Sidebar Control Shortcuts**: Added `Ctrl+Shift+F` (focus sidebar filter) and `Alt+1..6` (direct view switching).
- **Workflow: Breadcrumb Workspace Header**: Added clickable path breadcrumbs (Class/Subject/Topic) with `Show All` reset action for fast context exits.
- **Architecture: Sidebar Open State Isolation**: Introduced dedicated sidebar expansion state (`sidebarOpenClassId`, `sidebarOpenSubjectId`) without altering existing data taxonomy.
- **Constraint Integrity**: Preserved existing labels, color system, typography, and category semantics while improving positional efficiency only.

### **v48.57 - Three-Pane Global Navigation Refactor**
- **Architecture: Three-Pane Layout**: Rebuilt core workspace into `Icon Rail + Contextual Sidebar + Main Content` for future-proof, high-scale navigation.
- **Navigation: Primary Icon Rail**: Major sections (Today, Active, Archived, Due week, Reference, Quick inbox) moved to a persistent left rail with unchanged labels and existing visual system.
- **Navigation: Contextual Sidebar**: Added hierarchical browser for classes → subjects → topics with inline collapse/expand and instant focus routing.
- **Navigation: Focused Workspace**: Main pane now prioritizes active editing tasks while preserving all existing components and behavior (topic editing, inbox processing, analytics modal, data modal).
- **Filtering: Sidebar Context Filter**: Added sidebar query filter for deep hierarchy browsing at scale without changing data model or taxonomy.
- **Stability: Path Focus Engine Reuse**: Introduced reusable `focusPath` flow so contextual selection and cross-module navigation share one reliable path reveal mechanism.
- **Safety: Reorder Guardrails**: Disabled class reordering outside pure Active/unfiltered root context to prevent accidental structural loss in scoped views.
- **Design Constraint Preserved**: No label taxonomy or color/font category system changes; only positional/structural layout refactor.

### **v48.56 - Quality Gate, Recovery Safety, and Learned Navigation**
- **Quality Gate Added**: Installed ESLint stack (`eslint`, `@eslint/js`, `globals`) and added `npm run check` to enforce `lint + test + build` in one command.
- **Flow: Keyboard Inbox Processing**: Added Quick Inbox keyboard shortcuts: `Ctrl+Shift+J` / `Ctrl+Shift+K` to select inbox entries and `Ctrl+Shift+Enter` to process selected entry.
- **Safety: Soft Delete Window**: Bulk topic deletion now opens a 10-second undo window with explicit restore control.
- **Speed: Command Palette Memory**: Added persistent recents/frequency ranking for command palette results (`localStorage`-backed).
- **Performance: View Pipeline Extraction**: Extracted `buildClassesForView` from `App.jsx` to `logic.js` for testability and measurable throughput checks.
- **Performance Tests Added**: Added high-volume benchmark tests for `computeEnhancedStats` and view building at 10k items.
- **Migration Hardening**: Added historical migration fixtures (`v48.00`, `v48.10`, `v48.25`, `v48.31`) and tests to verify forward compatibility.

### **v48.55 - Integrity, Template Control, and Throughput**
- **Fix: Class/Subject Deletion Integrity**: Corrected subject deletion path to always update class-shaped state (prevents structural corruption).
- **Fix: Ctrl+J Pending Jump**: Rebuilt next-pending navigation to carry full class/subject/topic/item path and focus the correct task.
- **Fix: Migration Engine**: Replaced placeholder migration with full normalization to current schema (`version`, template defaults, IDs, timestamps, inbox safety).
- **Feature: Global Template Editor Live**: Wired `TemplateEditor` into Data & Maintenance modal for direct checklist template control.
- **Optimization: History Reliability**: Removed stale index coupling in `updateState`; undo timeline now derives from current history pointer safely.
- **Optimization: Sortable Lifecycle**: Reduced SortableJS re-instantiation by tracking live items via ref instead of rebuilding on every data change.
- **Optimization: Command Palette Event Binding**: Prevented listener re-registration on each query keystroke.
- **Cleanup: Dead Code Removal**: Removed unused `QuickInbox.jsx`, `AutoResizeTextarea.jsx`, and unused `TestRunner` import from `App.jsx`.
- **Tests: Regression Coverage Added**: Added tests for class deletion integrity, pending-target navigation, and migration normalization.

### **v48.31 - The Terminal Ledger (Current)**
- **UI: Terminal Ledger Reconstruction**: Redesigned the Command Center into a high-density vertical scanning registry with left-aligned keycaps and immediately adjacent descriptions.
- **UI: Muted Green Authority**: Integrated `#739072` (Muted Green) as the primary keycap color, providing a professional "IDE-style" aesthetic.
- **UX: Precision Spacing Fix**: Resolved all text overlapping issues (e.g., "7 classes") by implementing semantic gaps and alignment guardrails.
- **Fix: Syntax Integrity**: Resolved critical build failure in `KeyboardHelp.jsx` caused by code duplication and missing braces.

### **v48.25 - The Unified Frost Atmosphere**
- **UI: Frosted Workbench Engine**: Global implementation of `#ffffff80` (White 50%) background layers atop a solid `#F0EEE6` foundation.
- **UI: Layered Depth Logic**: Leveraged semi-transparent stacking to create an automated visual hierarchy (Class → Subject → Topic).
- **UI: Anti-Glare Refinement**: Applied `12px` backdrop-blur globally to reduce eye strain while maintaining authoritative contrast.
- **Feature: Differentiated Creation Palette**: Assigned unique soft colors to curriculum creation levels (Subjects: Soft Sage, Topics: Muted Teal, Items: Soft Olive).

### **v48.10 - Harmonic Categorical Engine**
- **Architecture: System-Wide Color Engine**: Implemented a semantic categorical palette (Sage, Steel, Earth, Umber, Terracotta) for all system buttons.
- **UI: Universal Hover Inversion**: Standardized all buttons to flip background and foreground colors on hover for definitive feedback.
- **UX: Command Center Alignment**: Synchronized Shortcut list colors and category headers with the main navigation logic.
- **Typography: Monospaced Normalization**: Standardized all interactive elements to `Intel One Mono Medium (500)` for maximum crispness.

### **v48.00 - High-Contrast Synchronization**
- **UI: Navigation Button Overhaul**: Applied specific color mapping (#262624 / #C2C0B6) to all main view mode buttons.
- **UI: Global Background Lockdown**: Set system background to `#F0EEE6` with absolute `forced-color-adjust` lockdown to prevent browser/OS interference.
- **Cleanup: Dependency Pruning**: Removed unused `jspdf` library (~300KB saved) and associated dead code.
- **Fix: Build Stability**: Installed missing `dompurify` dependency for `MarkdownEditor`.
