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

## Phase 2: Launch Three Review Agents in Parallel

Use the Agent tool to launch all three concurrently in a single message. Pass each the full diff.

### Agent 1: Code Reuse Review

1. **Search for existing utilities, composables, and helpers** that could replace newly written code — common locations are shared modules, `use*` composables, and files adjacent to the changed ones.
2. **Flag any new function/composable that duplicates existing functionality.** Suggest the existing one.
3. **Flag inline logic that could use an existing utility or composable** — hand-rolled reactivity, manual DOM work, ad-hoc formatting, custom type guards.

### Agent 2: Code Quality Review

1. **Redundant state**: state duplicating other state, `ref`s that could be `computed`, watchers that could be direct calls
2. **Parameter/prop sprawl**: adding props instead of generalizing or restructuring
3. **Copy-paste with slight variation**: near-duplicate template blocks or `setup` logic that should share an abstraction
4. **Leaky abstractions**: a feature reaching into another feature's internals; exposing internal refs that should be encapsulated
5. **Stringly-typed code**: raw strings where a union type, enum, or i18n key already exists
6. **Unnecessary template nesting**: wrapper `<div>`/`<template>` elements that add no layout value — check if inner component props already provide the behaviour
7. **Nested conditionals**: `v-if` ladders, nested ternaries, or `setup` branching 3+ deep — flatten with early returns, a computed, or a lookup
8. **Unnecessary comments**: comments narrating WHAT the code does or referencing the task — delete; keep only non-obvious WHY (hidden constraints, subtle invariants, workarounds)
9. **Hardcoded strings/styles**: user-facing text not going through i18n; magic Tailwind values that break the styling conventions

### Agent 3: Efficiency Review

1. **Unnecessary work**: redundant computeds, repeated lookups, duplicate API calls, N+1 patterns
2. **Missed concurrency**: independent async operations run sequentially
3. **Hot-path / render bloat**: heavy work in `setup` run on every render, or in per-frame canvas handlers
4. **Recurring no-op updates**: store/ref writes in handlers or watchers that fire unconditionally
5. **Reactivity leaks**: missing cleanup, event listeners not removed on unmount, unbounded arrays/maps
6. **Overly broad operations**: re-rendering the whole canvas when one node changed; loading all items when filtering for one

## Phase 3: Fix Issues

Wait for all three agents. Aggregate findings and fix each directly. If a finding is a false positive or not worth addressing, note it and move on. When done, briefly summarize what was fixed (or confirm the code was already clean).
