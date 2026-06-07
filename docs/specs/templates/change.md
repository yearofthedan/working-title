# [Short title]

**type:** change
**date:** YYYY-MM-DD
**tracks:** handoff.md # entry-name → docs/architecture.md or the relevant docs/guides/ doc

---

## Context

Why this change exists. One paragraph max — the background belongs in the architecture or guide docs.

## User intent

> State the core intent — not the edge case, not the mechanism.
> Write it as: *As a [user type], I want [action], so that [outcome].*
> Describe what the user is trying to achieve, not how the implementation
> handles a particular scenario. Every design decision in the spec should
> trace back to this — if a proposed behaviour contradicts the intent, the
> behaviour is wrong.

*As a …, I want …, so that …*

## Domain & boundaries

> The DDD lens — fill before placement decisions. Name the domain concepts this
> touches, then where the code lives. The executor must not cross these
> boundaries (see `docs/architecture.md` §Structural Conventions and the model
> map in `docs/domain.md`).

- **Domain models involved:** which concepts (Step, Connection, Template, Track,
  Node, Canvas, …) this reads, creates, or mutates — and which context/feature
  owns each (per the `docs/domain.md` model map).
- **Placement:** target layer per unit — `src/utils`/`src/infra` (pure TS, no
  Vue) vs `src/features/[feature]` (Vue); composable vs component; co-located
  with its concern.
- **Boundary risks:** cross-feature imports, Vue leaking into pure TS, or a
  composable that should be feature-local — flag any the design flirts with.

## Relevant files

> Files the executor should read before starting. The spec agent populates
> this during exploration — it's nearly free since you already read these
> files. Include files with reusable logic, similar patterns, shared types,
> composables, or code that will be directly modified.

- `src/path/to/file.ts` — why it matters

### Red flags

> Code smells in the target area to fix before/during this work, not extend:
> oversized components, logic that belongs in a composable, duplicated
> template blocks, a feature reaching into another feature's internals.
>
> **Test hotspots:** Check the test files that will be touched. If any are
> large or brittle, note a prep step to refactor before adding new tests
> (see `docs/guides/vue-testing.md`).
>
> **Layer-fit check (per AC):** Is the behaviour a pure function of its inputs
> (unit-test the composable/util directly) or does it need a mounted component
> / router / canvas wiring (component or e2e test)? Mark it next to each AC so
> the executor doesn't default to mounting everything.

- (none, or list smells found during exploration)

## Value / Effort

> Use this to decide whether to do the task *now*. Answer honestly:
> 1. How does this make the user's job easier — in their terms, not ours?
> 2. Is this a real problem someone hits today, or hypothetical?
> 3. Is there a simpler way to solve it for the user?
> The design must map to the value statement. If it doesn't, one of them is wrong.

- **Value:** What does this make easier, and what failure mode does it prevent?
- **Effort:** Implementation surface — components/composables touched, new concepts, interactions with the canvas/domain.

## Behaviour

Acceptance criteria as concrete **input → output** (or **state → rendered result**) statements.

> For each criterion ask: "what's the laziest wrong implementation that still
> satisfies this line?" If you can think of one, tighten it. After writing all
> ACs, re-read for contradictions — a faithful implementer must not be able to
> produce conflicting behaviour.

- [ ] Given [input/props/state], renders/produces [exact expected output]
- [ ] Given [empty/zero case], [specific handling]
- [ ] Given [boundary or error input], [specific outcome]

> **Type/state matrix check:** Enumerate the distinct inputs that exercise
> different code paths — `.ts` vs `.vue` targets, prop combinations, empty vs
> populated canvas, loading/error/success states. Test the ones that flow
> through different code as separate ACs; don't assume symmetry.
>
> **Each AC is an independently observable behaviour.** Mechanical consequences
> are assertions within an AC's tests, not their own ACs.
>
> **More than 5 ACs → split the spec.** Each spec should land in a single slice.

## Public surface

What changes that other code (or the user) sees. Sketch it.

> For each, answer: what does it contain (an example value, not just the type)?
> realistic bounds / 10× case? the empty/absent case? the adversarial case
> (huge input, special characters, rapid re-render, concurrent canvas edits)?

- **Component props / emits:** new or changed `defineProps` / `defineEmits`
- **Composable API:** function signature, returned refs/computeds, params
- **Store / route / i18n:** new state shape, route params, translation keys

If a field or param has no answer here, the spec isn't ready.

## Open decisions

> If the implementation has a meaningful fork — multiple viable approaches with
> different correctness, risk, or maintainability profiles — list each here.
> Do NOT write "the executor should choose". Each entry: the decision (as a
> question), the options (2-3), the tradeoffs (correctness/maintainability, not
> just effort), and a recommendation. Implementation cannot start until every
> decision is resolved; then replace the question with the chosen approach, the
> reasoning, and the consequences. This record persists in the archived spec.

(none, or list decisions found during exploration)

## Edges

Constraints that aren't acceptance criteria but bound the implementation —
they become regression tests or guard assertions, not features.

- Interactions with existing canvas/domain behaviour ("rename a Step after a Connection exists must still …")
- Performance expectations ("must stay smooth at 200 nodes")
- Accessibility constraints (keyboard nav, focus order, ARIA)

## Done-when

- [ ] All ACs verified by tests
- [ ] `./do check` passes (lint + build + unit/browser tests); `./do e2e` passes if behaviour is user-facing
- [ ] `./do test-a11y` passes if UI changed; Storybook stories added/updated for new component states
- [ ] No touched component/composable has grown into "doing too much" — extract per `docs/guides/vue-composables.md` if it has
- [ ] Docs updated if a public surface changed (the relevant `docs/guides/` doc, `docs/domain.md` for new domain terms, i18n keys in `src/i18n/en.json`)
- [ ] Tech debt discovered during implementation added to handoff.md as `[needs design]`
- [ ] Non-obvious gotchas recorded in the relevant `docs/guides/` doc, or `.claude/MEMORY.md` if cross-cutting (skip if nothing worth recording)
- [ ] Spec moved to `docs/specs/archive/` with an Outcome section appended
