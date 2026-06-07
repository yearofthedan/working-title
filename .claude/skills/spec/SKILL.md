---
name: spec
description: Create or refine a task specification from a handoff.md entry — picks the right template, walks through design decisions with the user, and produces a ready-to-implement spec file.
metadata:
  internal: true
---

# Spec Workflow

**Hard rule: steps 1–13 are checkpoints, not suggestions.** When a step says "confirm with the user", "ask the user", or "do NOT proceed" — STOP. Output what you have and wait. Do not write spec files, update handoff.md, or commit until the user has agreed to the ACs at step 7. Skipping checkpoints to "save time" makes the workflow useless. Steps 3–6 and 8–12 produce draft content written to disk only AFTER step 7 confirmation.

1. **Identify the task.** Read `docs/handoff.md` — find the entry the user wants to spec. If none specified, show the `[needs design]` entries and ask which one.

2. **Pick the template.** Read `docs/specs/templates/`. Choose:
   - `change.md` — new capability, enhancement, refactoring, or tech debt
   - `bug.md` — something is broken and needs fixing

3. **Create the spec file.** Name it `docs/specs/YYYYMMDD-short-slug.md` (today's date, 2-4 word lowercase hyphenated slug). Copy the template content.

4. **Fill in Context / Symptom.** Pull from the handoff entry and any linked docs. One paragraph — deeper background belongs in the architecture or guide docs.

5. **Fill in User intent (change only).** *As a [user type], I want [action], so that [outcome].* This describes what the user is trying to achieve — not an edge case, not a mechanism. Every AC must trace back to it.

6. **Fill in Value / Effort.** Why it's worth doing now and what the implementation surface looks like. If value is low or effort high relative to alternatives, flag it before continuing.

7. **Draft the Behaviour / Fix section with the user.** The core of the spec.
   - **Slice vertically, not horizontally.** Each AC is a thin slice of user-observable behaviour — a "User can [verb] [noun]" you could demo — not a technical layer. Don't write ACs that build a layer in isolation ("add the composable", then "add the component", then "add the tests"); that defers integration risk to the end and leaves tests last. Too granular ("add a button") means no behaviour; too coarse ("build the panel system") means split. Bootstrapping exception: the first AC may be "component renders in Storybook" to stand the slice up.
   - **Changes:** Write ACs as input → output (or state → rendered result) pairs. For each, ask "what's the laziest wrong implementation that still satisfies this?" Then apply the **type/state matrix check**: enumerate the distinct inputs that exercise different code paths — `.ts` vs `.vue` targets, prop combinations, empty vs populated canvas, loading/error/success states. Things that flow through different code get separate ACs; don't assume symmetry. More than 5 ACs → stop and discuss splitting.
   - **Bugs:** Describe the fix — what to change and where. Bugs don't have ACs; Expected defines the target, Done-when defines verification. The fix dispatches as a single unit.
   - Do NOT proceed past this step without user agreement.

8. **Flag open implementation decisions.** Where you found a meaningful fork with **different correctness or risk profiles** (e.g. composable vs feature-local state, watch vs computed, new abstraction vs inline), add an `## Open decisions` section: the decision (as a question), the viable approaches, the tradeoffs (correctness/maintainability, not just effort), and a recommendation. These are architectural forks, not details the executor figures out. The spec cannot be picked up until every open decision is resolved. Never write "the executor should choose".

9. **Fill in Domain & boundaries.** From the concepts in the User intent and the code you explored, name the domain models involved and which context/feature owns each — cross-check the model map in `docs/domain.md` (add a row there if a model is missing). Then state the placement per unit (`utils`/`infra` pure TS vs `features/` Vue; composable vs component) and flag any boundary risks (cross-feature imports, Vue in pure TS, a composable that should be feature-local), per `docs/architecture.md` §Structural Conventions. This is the DDD lens; resolve a boundary risk here, not in the execution agent.

   **Populate Relevant files and Red flags.** List the files you read that hold reusable logic, similar patterns, shared types, or composables — with a note on why each matters. Note code smells in the target area (oversized components, logic that belongs in a composable, duplicated template, cross-feature reach-ins) under Red flags.

   **Test hotspot assessment:** Check the test files this spec will touch. If any are large/brittle, include a prep step to refactor before adding tests (see `docs/guides/vue-testing.md`).

   **Layer-fit pre-check (per AC):** Is the behaviour a pure function of its inputs (unit-test the composable/util directly) or does it need a mounted component / router / canvas wiring? Note it under each AC so the executor doesn't default to mounting everything.

10. **Fill in Public surface (change only).** For every prop/emit, composable signature, store shape, route param, or i18n key: what does it contain (example value)? realistic bounds / 10× case? empty/absent case? adversarial case? If a field has no answer, the spec isn't ready.

11. **Fill in Edges.** "What must NOT change?" and "what assumptions are we making?" These become regression tests.

12. **Review the Done-when checklist.** Add task-specific verification (e.g. "a11y passes", "story added for the error state"). Check `.claude/skills/` for any skill that references changed behaviour and add updates to Done-when.

13. **Update handoff.md.** Change the entry from `[needs design]` to a link to the new spec file. The handoff entry becomes one line.

14. **Confirm with the user.** Show a summary — for Changes: number of ACs and key surface decisions; for Bugs: fix approach and verification; plus any open decisions. Ask: "Ready to implement, or want to revise?"

15. **Report for commit.** Tell the caller the spec file and updated handoff.md are ready to commit with `docs(specs): add spec for [short-title]`. **Do NOT commit until the user has explicitly signed off.** A premature commit forces amends when the user requests changes.
