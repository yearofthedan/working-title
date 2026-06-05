# [Short title]

**type:** bug
**date:** YYYY-MM-DD
**tracks:** handoff.md # entry-name

---

## Symptom

What's happening. Exact error message, wrong output, or broken interaction.

## Value / Effort

> Use this to decide whether to fix *now*. A bug with no workaround is higher
> value than one easily sidestepped. Is the root cause clear? Is the fix
> localised or does it ripple through many call sites?

- **Value:** How often does this bite users? What's the workaround cost?
- **Effort:** Root cause clear? Localised patch vs. ripple?

Include a reproduction if possible:

```
input:    [props / state / user action]
actual:   [what happened]
expected: [what should have happened]
```

## Expected

What should happen instead. Same concrete format: input/state → expected result.

## Root cause

*Filled in during investigation. Leave blank in the initial spec.*

Be specific enough that someone could point to the line(s) responsible.
"The computed doesn't react to the prop change" beats "the state is wrong".

## Fix

Describe what to change — components, composables, store, config — so the
Expected behaviour is restored. This is an implementation path, not acceptance
criteria. Bugs don't have ACs; **Expected** defines the target and **Done-when**
defines verification.

> **Adjacent inputs:** What variations of the failing input might also be broken?
> Empty vs one vs many nodes, a different Step type, a connection that loops back.
> If the bug is a boundary condition, the adjacent inputs often reveal siblings —
> write regression tests for them too.

## Edges

Related cases to verify — the fix shouldn't be so narrow it only covers the
reported symptom.

- Sibling inputs (same shape, different values)
- Other code paths sharing the same logic
- Could the fix regress the happy path?

## Done-when

- [ ] Reproduction case now produces expected output
- [ ] Regression test covers the exact failing case
- [ ] `./do check` passes (lint + build + test); `./do e2e` passes if the bug was user-facing
- [ ] Docs updated if a public surface changed
- [ ] Tech debt discovered during investigation added to handoff.md as `[needs design]`
- [ ] Non-obvious gotchas recorded in the relevant `docs/guides/` doc, or `.claude/MEMORY.md` if cross-cutting
- [ ] Spec moved to `docs/specs/archive/` with an Outcome section appended
