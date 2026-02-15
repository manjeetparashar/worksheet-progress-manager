## Summary
- What changed?
- Why does this make the user faster?

## Scope
- Type: `feature` / `fix` / `perf` / `refactor` / `docs` / `ci`
- Affected areas:
- Risk level: `low` / `medium` / `high`

## Performance Evidence (Required for UI/State/Render changes)
- Chrome DevTools run date:
- Baseline reference: `perf/chrome-devtools-baseline.json`
- Before:
  - `viewSwitchP95Ms=`
  - `longTasksCount=`
  - `filterResponseP95Ms=`
  - `fpsMin=`
- After:
  - `viewSwitchP95Ms=`
  - `longTasksCount=`
  - `filterResponseP95Ms=`
  - `fpsMin=`
- Result: `improved` / `no change` / `regressed`

## Quality Gate
- [ ] `npm run perf:guard` passed locally
- [ ] `npm run check` passed locally
- [ ] CI `Project Quality Gate / build-and-test` passed

## Behavioral Safety
- [ ] No changes to labels, colors, typography, or categorization unless explicitly intended
- [ ] Existing keyboard flows still work (`/`, `Alt+1..6`, `Ctrl+Shift+M`, `Alt+Z`)
- [ ] No critical feature regression detected

## Changelog / Docs
- [ ] `changelog.md` updated
- [ ] `README.md` updated when feature/behavior/workflow changed

## Validation Notes
- Test output summary:
- Edge cases checked:
- Follow-up work (if any):
