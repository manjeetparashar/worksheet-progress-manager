# Friction Capture Template (Power-User Loop)

Use this during real work. One row per friction event.

## Quick Rule
- If it slowed you down, log it.
- If it happened more than once, prioritize it.
- If it cannot be measured, define a measurable proxy.

## Entry Format

```text
date:
flow:
trigger:
observed_delay_sec:
frequency_per_day:
current_workaround:
impact:
desired_outcome:
proposed_fix:
metric_to_improve:
target_value:
```

## Example

```text
date: 2026-02-16
flow: View switch (Today -> Active -> Due week)
trigger: Rapid keyboard navigation during planning
observed_delay_sec: 0.6
frequency_per_day: 25
current_workaround: Pause between switches
impact: Breaks concentration and sequence planning
desired_outcome: Near-instant view response while chaining shortcuts
proposed_fix: Memoize sidebar row derivation and defer non-visible pane work
metric_to_improve: viewSwitchP95Ms
target_value: <= 350
```

## Weekly Review (10 minutes)
1. Sort entries by `frequency_per_day * observed_delay_sec`.
2. Pick top 1-2 items only.
3. Open a PR with measurable before/after.
