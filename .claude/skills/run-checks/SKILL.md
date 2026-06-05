---
name: run-checks
description: Use when running ./do check, ./do test, ./do build, ./do e2e, or any long-running command. Captures output with tee so you never re-run a command just to see different parts of the output.
metadata:
  internal: true
---

# Running checks and tests

## The gate

This project runs everything through `./do`:

- **`./do check`** — the full fast gate: `lint . && build && test` (unit + browser via vitest). Run this before finishing a task.
- **`./do test [path]`** — vitest; pass a path to scope to one file.
- **`./do e2e`** — Playwright end-to-end. Slower; run at Done-when when behaviour is user-facing.
- **`./do test-a11y`** — Storybook + a11y checks.

> If `./do check` doesn't exist yet, it's the first `[chore]` in `docs/handoff.md`. Until then run `./do lint . && ./do build && ./do test`.

## Golden rule: capture once, read many

Long-running commands produce large output. **Never re-run a command just to see a different section of the output** — every re-run wastes minutes and tokens.

Always capture with `tee` on the first run:

```bash
./do check 2>&1 | tee /tmp/check.log
```

Then use the `Read` tool on `/tmp/check.log` to inspect any section — failures, summary, specific lines. No second run needed.

## Scoped runs first

When working on a specific file, run only the relevant tests before the full gate:

```bash
./do test src/path/to/relevant.spec.ts 2>&1 | tee /tmp/test.log
```

Only run the full `./do check` once, after all code changes are complete and scoped tests pass.

## What NOT to do

- `./do test 2>&1 | grep "FAIL" | head` — runs the full suite, discards most output, then you re-run to see details
- `./do test 2>&1 | tail -20` — same problem
- Running `./do check` repeatedly hoping for different output
- Running any check without `tee` and then re-running to read a different section
