**Purpose:** Current state and the prioritised queue of next work items. Each task either links to a spec file (ready to implement) or is marked `[needs design]` (needs a `/spec` pass first).
**Audience:** Engineers and AI agents working on working-title.
**Status:** Current

---

# Handoff Notes

Context that isn't in the architecture or guide docs — what you need to know before picking up work. The workflow is **handoff → /spec → /slice**.

## Start here

New to the codebase? Read in this order:
1. [`docs/architecture.md`](architecture.md) — guiding principles (DDD, feature isolation, UI-centric canvas) and directory structure
2. [`docs/domain.md`](domain.md) — core terminology (Step, Template, Canvas, Track, Connection, Node, Stage)
3. [`docs/tech-stack.md`](tech-stack.md) — the stack and how it fits together
4. [`docs/guides/`](guides/) — testing (`tdd-patterns.md`, `vue-testing.md`), composables, styling, i18n, icons

## Picking up a task?

Tasks have one of three states:
- **`[chore]`** → implementation is unambiguous; implement directly, no spec needed. Decision context is in the task description. Use for deferred admin (config changes, dep bumps, doc edits, dead-code removal). Inline refactors spotted mid-session don't need an entry — apply them in a separate commit and move on.
- **`[needs design]`** → problem understood, solution not yet agreed. Run `/spec` to design it with the user before writing code.
- **Has a spec link** → already designed. Read the spec, then run `/slice`.

An agent discovering new work adds a `[needs design]` entry and moves on — do not design it in the same session.

## Finishing a task?

The spec's Done-when section is the checklist. Key items: remove the task entry below (this is a queue, not a history), update Current state if layout/test counts changed, archive the spec to `docs/specs/archive/` with an Outcome section, and record cross-cutting gotchas in `.claude/MEMORY.md` or the relevant `docs/guides/` doc.

---

## Current state

Vue 3 + Vite + TypeScript SPA (visual workflow/graph editor). Mid-migration off Roo onto Claude Code. Commands run through `./do <cmd>` (`test`, `lint`, `build`, `e2e`, `e2e-ui`, `test-a11y`, `dev`, `preview`, `storybook`). The compiler-aware refactoring CLI is `weaver` (formerly the `light-bridge` MCP).

## Roo → Claude migration queue

> Bootstrapped by hand: `/slice`, `/spec`, `execution-agent`, `run-checks`, `implementation-context`, `review-changes`, this file, and the spec templates. The items below are run *through* that workflow as slices.

### [chore] Decommission Roo
Delete `.roo/`, `.roomodes`, `.cursor/`. Remove `RooVeterinaryInc.roo-cline` + the `roo-cline.autoImportSettingsPath` setting from `.devcontainer/devcontainer.json`. Salvage any rule content not already in `docs/` first.

### [chore] Drop light-bridge MCP; wire weaver CLI
Remove `.roo/mcp.json`, `.cursor/mcp.json`, and the `npm i -g @yearofthedan/light-bridge` line in `.devcontainer/onCreate.sh`. Ensure `weaver` is available in the container. (The `code-inspection`/`refactor`/`search-and-replace` skills come from weaver's published skills, not this repo.)

### [chore] Web-inspect via Playwright MCP
Add root `.mcp.json` with `@playwright/mcp`. Retire `./do launch-chromium-debug` and its `postStartCommand`. Point the inspect loop at the Vite dev server (5173) and Storybook (6006).

### [chore] Devcontainer security hardening
Add `"dev.containers.copyGitConfig": false` and `"dev.containers.gitCredentialHelperConfigLocation": "none"` (stop host git creds leaking into the agent container). Pin the remaining `latest` features (git, github-cli) to exact versions. Drop CDP debug port 9222. Remove/pin the root `uv` installer in the Dockerfile if unused. Add `set -euo pipefail` to `onCreate.sh`.

### [chore] Pin git identity in the devcontainer
Set a repo-local personal identity, and fix `.devcontainer/onCreate.sh` so it honours `GH_USER`/`GH_EMAIL` overrides and defaults to the intended account, instead of taking `git config user.name/email` from whatever account `gh` happens to be logged in as inside the container — mirror weaver's `scripts/bootstrap-gh.sh`. Prevents commits being mis-attributed to the wrong account.

### [chore] Add `anthropic.claude-code` to devcontainer + postStart.sh
Mirror weaver: add the extension and a `postStart.sh` that refreshes the CLI.

### [needs design] Architecture lens for /spec and /slice
The ported slice/spec are general. Add a step that checks feature-isolation / DDD boundaries / composable-vs-feature placement before dispatching to the execution agent. Working-title-specific; the canvas/domain split is the thing to protect.

### [needs design] Consolidate ported skills
Some ported skills overlap once slice/spec exist. Decide what survives standalone and whether to add a `docs/code-standards.md` (the skills reference one; standards currently live across `docs/guides/`).

### [needs design] Bring across remaining Roo skills worth keeping
`storybook-workflow` and `workflow-third-party-libraries` from `.roo/skills` have no slice/spec equivalent. Assess and port as Claude skills if still useful.

> **Deferred (COULD):** mutation testing (Stryker) on the domain/composables layer — on hold; revisit after the migration lands.
