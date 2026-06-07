**Purpose:** Current state and the prioritised queue of next work items. Each task either links to a spec file (ready to implement) or is marked `[needs design]` (needs a `/spec` pass first).
**Audience:** Engineers and AI agents working on working-title.
**Status:** Current

---

# Handoff Notes

Context that isn't in the architecture or guide docs — what you need to know before picking up work. The workflow is **handoff → /brainstorm → /spec → /slice**.

## Start here

New to the codebase? Read in this order:
1. [`docs/architecture.md`](architecture.md) — guiding principles (DDD, feature isolation, UI-centric canvas) and directory structure
2. [`docs/domain.md`](domain.md) — core terminology (Step, Template, Canvas, Track, Connection, Node, Stage)
3. [`docs/tech-stack.md`](tech-stack.md) — the stack and how it fits together
4. [`docs/guides/`](guides/) — testing (`tdd-patterns.md`, `vue-testing.md`), composables, styling, i18n, icons

## Picking up a task?

Tasks have one of three states:
- **`[chore]`** → implementation is unambiguous; implement directly, no spec needed. Decision context is in the task description. Use for deferred admin (config changes, dep bumps, doc edits, dead-code removal). Inline refactors spotted mid-session don't need an entry — apply them in a separate commit and move on.
- **`[needs design]`** → problem understood, solution not yet agreed. Start with `/brainstorm` to explore intent and agree a design with the user; it flows into `/spec`. Don't write code, or jump straight to `/spec`, before the design is agreed.
- **Has a spec link** → already designed. Read the spec, then run `/slice`.

An agent discovering new work adds a `[needs design]` entry and moves on — do not design it in the same session.

## Finishing a task?

The spec's Done-when section is the checklist. Key items: remove the task entry below (this is a queue, not a history), update Current state if layout/test counts changed, archive the spec to `docs/specs/archive/` with an Outcome section, and record cross-cutting gotchas in `.claude/MEMORY.md` or the relevant `docs/guides/` doc.

---

## Current state

Vue 3 + Vite + TypeScript SPA (visual workflow/graph editor). Mid-migration off Roo onto Claude Code. Commands run through `./do <cmd>` (`test`, `lint`, `build`, `e2e`, `e2e-ui`, `test-a11y`, `dev`, `preview`, `storybook`). The compiler-aware refactoring CLI is `weaver`.

## Roo → Claude migration queue

> Bootstrapped by hand: `/slice`, `/spec`, `execution-agent`, `run-checks`, `implementation-context`, `review-changes`, this file, and the spec templates. The items below are run *through* that workflow as slices.

### [chore] Add `anthropic.claude-code` to devcontainer + postStart.sh
Mirror weaver: add the extension and a `postStart.sh` that refreshes the CLI.

### [needs design] Architecture lens for /spec and /slice
The ported slice/spec are general. Add a step that checks feature-isolation / DDD boundaries / composable-vs-feature placement before dispatching to the execution agent. Working-title-specific; the canvas/domain split is the thing to protect.

### [needs design] Consolidate ported skills
Some ported skills overlap once slice/spec exist. Decide what survives standalone and whether to add a `docs/code-standards.md` (the skills reference one; standards currently live across `docs/guides/`).

### [chore] Finish Roo-skill salvage
Leftover fold-ins from the Roo decommission. Originals recoverable via `git show 8039e2c^:.roo/skills/<name>/SKILL.md`.
- Fold `workflow-general` standards into AGENTS.md hard rules: no `any`, no type casting, `@/*` alias, build-before-test, tests-as-docs.
- Check `workflow-vue` heuristics vs `docs/guides/vue-*.md`; fold any missing (Props-vs-Context at 3+ consumers, extract >100 lines, styling hierarchy semantic>theme>utility, `flex-h/flex-y`).
- Port `adding-do-scripts` → short `docs/guides/do-scripts.md` (only matters when adding `./do` commands).
- Compare `agent-skills-standard.md` vs the `writing-skills` skill; keep the better.

> **Deferred (COULD):** mutation testing (Stryker) on the domain/composables layer — on hold; revisit after the migration lands.
