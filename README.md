# Worksheet Manager (Earth & Ochre v49.09)

![Build Status](https://github.com/manjeetparashar/worksheet-progress-manager/actions/workflows/ci.yml/badge.svg)

**Fastest, most productive, most advanced, most efficient.**  
A local-first, keyboard-centric productivity tool for power-user educators.

---

## ⚡ Core Philosophy
> "Open → Instant → Act → Ctrl+Z if wrong. No dialogs, no friction, no dead weight."

*   **Local Sovereignty**: All data lives in `IndexedDB` and your local file system.
*   **Vim-Inspired Navigation**: Navigate your entire curriculum without touching the mouse.
*   **Earth & Ochre Theme**: A visually soothing, organic palette (Warm Parchment & Obsidian Hearth) designed for long-term focus without eye strain. Independent of system/browser coloring schemes.

---

## 📂 System Anatomy

### 1. **The Brain (State & Flow)**
*   **`src/App.jsx`**: Main UI orchestrator composing state, shortcuts, services, and three-pane composition.
*   **`src/hooks/useAppState.js`**: Core state/history/persistence orchestration with read-only lock enforcement.
*   **`src/hooks/useSafetyServices.js`**: Safety telemetry and backup-rotation services.
*   **`src/hooks/useSidebarNavigatorState.js`**: Context sidebar state/rows/selection/splitter orchestration.
*   **`src/hooks/useViewContextMemory.js`**: Per-view navigation memory, persistence, and context reconciliation.
*   **`src/hooks/useBookmarks.js`**: Bookmark persistence and quick-jump creation logic.
*   **`src/hooks/useCommandActions.js`**: Command palette action orchestration for macros/views/navigation/system operations.
*   **`src/context.js`**: Data highway for class/subject hierarchy.
*   **`src/constants.js`**: System config and checklist templates.

### 2. **Logic & Intelligence**
*   **`src/utils/logic.js`**: Progress math, visibility rules, and Batch Template Sync engine.
*   **`src/utils/test.js`**: Diagnostic suite for system health.
*   **`src/utils/storage.js`**: IndexedDB persistence layer.
*   **`src/utils/data.js`**: Import/export and robust schema migration/normalization.
*   **`src/domain/actions.js`**: Pure domain actions for state mutation (bulk-safe, testable transformations).
*   **`src/components/QuickInboxProcessor.jsx`**: The engine for converting raw ideas into structured curriculum items.

### 3. **The Interface**
*   **Three-Pane Global Navigation**:
*   `Icon Rail`: Primary section switching (Today, Active, Archived, Due week, Reference, Quick inbox).
*   `Contextual Sidebar`: Infinite hierarchical browsing (Class → Subject → Topic) with collapse/focus controls.
*   `Main Workspace`: Focused editing and operations.
*   **Shell Components**:
*   `src/components/IconRail.jsx`
*   `src/components/ContextSidebar.jsx`
*   `src/components/WorkspacePane.jsx`
*   **Overlay Orchestrator**:
*   `src/components/AppOverlays.jsx` (bulk ops, rollback strip, system modals, and command/help overlays).
*   **`src/components/CommandPalette.jsx`**: The "/" search engine and action center.
*   **`src/components/AnalyticsDashboard.jsx`**: The data-driven cockpit.
*   **`src/components/TemplateEditor.jsx`**: Global checklist template editor (wired into Data & Maintenance modal).
*   **`src/components/VirtualScrollList.jsx`**: High-performance rendering engine.
*   **`src/hooks/useAppShortcuts.js` + `src/config/shortcuts.js`**: Centralized shortcut architecture with stable IDs and manifest-driven defaults.

---

## 🚀 Key Features

### 1. **Mouseless Zen**
*   **`j` / `k`**: Move selection Up/Down.
*   **`h` / `l`**: Drill Out/In (Class → Subject → Topic).
*   **`/`**: Open Command Palette.
*   **`Alt+Z`**: Toggle Zen Mode.
*   **`Ctrl+Shift+A`**: Rapidly capture ideas to the Quick Inbox.
*   **`Ctrl+Shift+J` / `Ctrl+Shift+K`**: Select previous/next Quick Inbox item.
*   **`Ctrl+Shift+Enter`**: Process selected Quick Inbox item instantly.
*   **`Ctrl+Shift+F`**: Focus contextual sidebar filter.
*   **`Alt+1..6`**: Jump directly between primary views from keyboard.
*   **`Ctrl+Shift+M`**: Cycle keymap mode (`navigation`, `editing`, `review`).
*   **`Ctrl+Shift+Z`**: Roll back the last logged operation instantly.
*   **`Alt+Shift+1..3`**: Run workflow macros (overdue sweep, capture+inbox, weekly planning).
*   **`Alt+B`**: Bookmark current hierarchy path.

### 2. **Maintenance Power**
*   **Integrated Quick Inbox**: Process captured ideas into new topics or existing tasks without leaving the app.
*   **Global Checklist Template Editor**: Modify checklist defaults once; reuse across all new topics and batch sync.
*   **Batch Template Sync**: Update all topics to match your template in one click.
*   **Zombies & Quick Wins**: Identify stale content and near-complete tasks instantly.
*   **Safe Bulk Delete**: Bulk delete includes a 10-second undo window for recovery under pressure.
*   **Learned Command Palette**: Frequently used and recent actions are ranked first automatically.
*   **Future-Proof Navigation Shell**: Three-pane structure keeps navigation clean as class/subject/topic depth grows.
*   **Progressive Disclosure Tree**: Contextual sidebar opens one active hierarchy branch at a time to stay uncluttered at scale.
*   **Breadcrumb Context Control**: Workspace header shows current hierarchy path and allows instant reset to full view.
*   **Resizable Sidebar Splitter**: Drag to allocate workspace vs navigator width based on current task.
*   **Per-View Navigation Memory**: Each major view restores its own sidebar filter, open branch, and selected context.
*   **Virtualized Outline Sidebar**: Context tree rendering remains responsive as hierarchy size scales.
*   **Scoped Autofocus Engine**: New class/subject/topic/item autofocus uses local container queries with strict creation-only gating to reduce layout churn.
*   **Low-Churn Hover Path**: Interaction surfaces now use scoped transition properties (not `transition-all`) and optimized sortable pointer handling for steadier navigation under heavy hierarchies.
*   **Reorder-On-Demand**: Drag-reorder listeners are active only in `editing` keymap mode, keeping normal navigation mode lighter under dense trees.
*   **Operation Journal Rollback**: Major actions are logged with one-click rollback safety.
*   **Shortcut Customization**: Rebind shortcuts inside Keyboard Help with conflict detection and reset.
*   **Review Mode Lock**: Read-only protection in `review` mode to prevent accidental writes.
*   **Hierarchy Bookmarks**: Persistent quick-jump points for frequently used paths.
*   **Macro Diff Preview**: Macro execution shows target diff summary before commit.
*   **Startup Telemetry**: Tracks hydration and first-input latency history.
*   **Backup Rotation**: Local rotating snapshots with retention/cap policy.
*   **Import Compatibility Dry-Run**: Preview migration impact before applying imported data.

---

## ✅ Quality Gate
*   **`npm run check`**: Runs `lint + test + build` in one pass.
*   **`npm run perf:budget`**: Runs dedicated performance budget tests.
*   **`npm run perf:guard`**: Runs only DevTools baseline guard tests for fast regression checks.
*   **Husky Pre-Commit**: Hook runs `npm run perf:guard` before commit for automatic local performance-budget protection.
*   **Husky Pre-Push**: Hook runs `npm run check` before push for full quality gate enforcement.
*   **Protected `main` Branch**: Direct pushes to `main` are blocked in GitHub; all changes flow through PRs.
*   **Required Cloud Status Check**: Merge requires `Project Quality Gate / build-and-test` to pass (27-test suite + lint/build gate).
*   **PR Template Enforcement**: `.github/pull_request_template.md` captures performance evidence, quality checks, and changelog/README memory updates for every PR.
*   **`.gitattributes` Line Normalization**: Enforces consistent LF/CRLF behavior across platforms for cleaner diffs and predictable hooks/scripts.
*   **`npm run perf:record`**: Generates machine-readable perf test report at `perf/vitest-perf-latest.json`.
*   **`perf/chrome-devtools-baseline.json`**: Persisted DevTools baseline budget artifact for before/after refactor comparison.
*   **`src/test/devtoolsBaseline.test.js`**: Enforces hot-navigation DevTools budget guard (`viewSwitchP95Ms`, `longTasksCount`) from baseline JSON.
*   **Sidebar Guard**: Baseline test also enforces `filterResponseP95Ms` and minimum `fpsMin` floor to prevent sidebar-scale regressions.
*   **`perf/README.md`**: Repeatable measurement workflow for synthetic + DevTools profiling.
*   **`perf/template-fill.md`**: Step-by-step DevTools checklist mapping trace metrics to baseline JSON fields.
*   **`docs/friction-capture-template.md`**: Lightweight production-use template for logging real workflow slowdowns and converting them into measurable optimization PRs.
*   **Trace Mode (`ws_perf_trace`)**: Optional compute-path timing logs for isolating view/sidebar/command build hotspots.
*   Regression coverage includes:
*   Historical migration fixtures (`v48.00`, `v48.10`, `v48.25`, `v48.31`).
*   Performance benchmarks for 10k-item analytics and view filtering pipeline.
*   CI workflow (`.github/workflows/ci.yml`) enforces the quality gate on push/PR.

---

## 🧹 Retired Components
*   Removed unused modules: `src/components/QuickInbox.jsx`, `src/components/AutoResizeTextarea.jsx`.

---

## 🔧 Setup

1.  `npm install`
2.  `npm run dev` (Vite dev server)
3.  `npm run build` (Production bundle)

---

**Built for the Power User.**
*No more waiting. Just teaching.*
