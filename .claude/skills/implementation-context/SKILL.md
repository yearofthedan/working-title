---
name: implementation-context
description: Use before writing code for an AC. Reads neighbouring code to absorb local patterns and find reusable code — so implementation fits the codebase, not just passes tests.
metadata:
  internal: true
---

# Implementation Context

Run this before writing tests for each AC. The goal: understand how the *nearby code* does things so your implementation fits naturally.

A fast "look around before you type" step — 2-3 minutes of reading, not a planning phase.

## Steps

### 1. Read the neighbourhood (2-3 files)

Look at files doing similar things to what you're about to write:
- The same feature directory as your target
- A similar component or composable (if adding one, read 2 existing ones)
- The caller — the component or composable your code will be used from

Read function/`setup` bodies and templates, not just signatures.

### 2. Extract local patterns

Note the conventions you need to match:
- **Reactivity** — `ref` vs `reactive` vs `computed`, when `watch`/`watchEffect` is used, `@vueuse/core` helpers favoured
- **Composables** — how shared logic is factored into `use*` functions, what they return (refs? readonly? actions?)
- **Component shape** — `<script setup>` style, `defineProps`/`defineEmits` typing, prop defaults, slot usage
- **Templates** — Tailwind class conventions (see `docs/guides/vue-styling.md`), icon usage (`@iconify/vue`), i18n via the app's `t()` not hardcoded strings
- **Feature isolation** — features own their Vue; infra/domain stays framework-agnostic (see `docs/architecture.md`). Don't reach into another feature's internals.
- **Test structure** — fixture/mount setup, what's mounted vs unit-tested, assertion style (see `docs/guides/vue-testing.md`)

### 3. Check for reusable code

Before writing anything new, look for:
- Existing composables (`use*`) that already do part of this
- Shared utilities and types
- Existing i18n keys, icons, and Tailwind patterns

Use what exists. Extend what almost exists. Only create when nothing fits.

### 4. Write to agent notes

In your agent notes file, record which files you read and the patterns you'll follow, what existing code you'll reuse, and anything the neighbourhood handles that your AC didn't mention but probably should (e.g. every similar component handles the empty-canvas state — yours should too).

If something in the neighbourhood contradicts the AC or dispatch brief, note it and match the codebase — working code wins over a brief that may not have seen it. Flag the deviation so the orchestrator knows.

## When to stop and report back

- The AC needs infrastructure that doesn't exist and isn't trivial to add
- You found a bug in existing code your AC would build on
- The neighbourhood reveals the AC's approach won't work (e.g. the composable doesn't expose what's assumed)
