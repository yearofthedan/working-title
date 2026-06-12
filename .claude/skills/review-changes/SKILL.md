---
name: review-changes
description: Review changed code for reuse, quality, and efficiency, then fix any issues found.
metadata:
  internal: true
---

# Review Changes: Code Review and Cleanup

Review all changed files for reuse, quality, and efficiency. Fix any issues found.

## Phase 1: Identify Changes

If a commit range was passed (e.g. `/review-changes abc123..def456`), run `git diff <range>`.

Otherwise run `git diff origin/main...HEAD` for all branch changes. If that returns nothing (branch at main, or no remote), fall back to `git diff HEAD` for staged changes. If still nothing, review the most recently modified files mentioned in this conversation.

## Phase 2: Launch Four Review Agents in Parallel

Use the Agent tool to launch all four concurrently in a single message. Pass each the full diff.

### Agent 1: Code Reuse Review

1. **Search for existing utilities, composables, and helpers** that could replace newly written code — common locations are shared modules, `use*` composables, and files adjacent to the changed ones.
2. **Flag any new function/composable that duplicates existing functionality.** Suggest the existing one.
3. **Flag inline logic that could use an existing utility or composable** — hand-rolled reactivity, manual DOM work, ad-hoc formatting, custom type guards.

### Agent 2: Code Quality Review

1. **Redundant state**: state duplicating other state, `ref`s that could be `computed`, watchers that could be direct calls
2. **Parameter/prop sprawl**: adding props instead of generalizing or restructuring
3. **Copy-paste with slight variation**: near-duplicate template blocks or `setup` logic that should share an abstraction
4. **Stringly-typed code**: raw strings where a union type, enum, or i18n key already exists
5. **Unnecessary template nesting**: wrapper `<div>`/`<template>` elements that add no layout value — check if inner component props already provide the behaviour
6. **Nested conditionals**: `v-if` ladders, nested ternaries, or `setup` branching 3+ deep — flatten with early returns, a computed, or a lookup
7. **Unnecessary comments**: comments narrating WHAT the code does or referencing the task — delete; keep only non-obvious WHY (hidden constraints, subtle invariants, workarounds)
8. **Hardcoded strings/styles**: user-facing text not going through i18n; magic Tailwind values that break the styling conventions

(Cross-feature structure and boundaries are Agent 4's remit, not this one's.)

### Agent 3: Efficiency Review

1. **Unnecessary work**: redundant computeds, repeated lookups, duplicate API calls, N+1 patterns
2. **Missed concurrency**: independent async operations run sequentially
3. **Hot-path / render bloat**: heavy work in `setup` run on every render, or in per-frame canvas handlers
4. **Recurring no-op updates**: store/ref writes in handlers or watchers that fire unconditionally
5. **Reactivity leaks**: missing cleanup, event listeners not removed on unmount, unbounded arrays/maps
6. **Overly broad operations**: re-rendering the whole canvas when one node changed; loading all items when filtering for one

### Agent 4: Architecture & Boundary Fit

Review the same changes against `docs/architecture.md` §Structural Conventions:

1. **Cross-feature reach-in**: a feature importing another feature's internals instead of a shared/public surface
2. **Vue boundary leak**: Vue components or Vue-specific composables outside `features/`, or Vue imports creeping into `utils/` or `infra/` (Conventions §2, §3)
3. **Misplaced composable**: a composable in a shared/top-level location that should be feature-local, co-located with the concern it serves (Convention §1)
4. **Over-wide surface**: exposing internal refs/state that should stay encapsulated — especially anything exported only so a test can reach it
5. **I/O outside the infra seam**: direct File System Access / IndexedDB / storage calls in a feature instead of going through an `infra/` provider

## Phase 3: Fix Issues

Wait for all four agents. Aggregate findings and fix each directly. If a finding is a false positive or not worth addressing, note it and move on. When done, briefly summarize what was fixed (or confirm the code was already clean).
