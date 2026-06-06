# AI Agent Context

Instructions for AI assistants working on working-title.

## Workflow

**handoff → /brainstorm → /spec → /slice.** Start from [docs/handoff.md](docs/handoff.md) — current state and the prioritised queue of next work. (`[chore]` items skip brainstorm/spec and are implemented directly.)

## Reference docs

- [Architecture](docs/architecture.md) — DDD, feature isolation, directory structure
- [Domain](docs/domain.md) — core terminology (Step, Template, Canvas, Track, Connection, Node, Stage)
- [Tech Stack](docs/tech-stack.md) — stack and libraries
- [Decisions](docs/decisions/index.md) — ADRs
- [Guides](docs/guides/) — testing, composables, styling, i18n, icons

## Skills

Executable workflows live in [.claude/skills/](.claude/skills/) (brainstorm, spec, slice, implementation-context, review-changes, run-checks, …). Invoke the one that matches the task.

## Hard rules

- **`./do` is the entry point** for every task (`test`, `lint`, `build`, `check`, `e2e`, …) — never the underlying tools.
- **pnpm only, exact versions** — dependencies pinned, no `^`/`~`.
- **TDD-first** — failing test before implementation.
- **Conventional commits**, one-line subjects, no padded bodies.
- **Feature isolation** — no cross-feature imports.

## Refactoring

For cross-file refactors (rename/move symbol or file, extract function), use the `weaver` CLI — the compiler handles the cascade across affected files.

## i18n

User-facing strings must not be hardcoded. App strings in [src/i18n/en.json](src/i18n/en.json); template strings in `src/features/process-templates/{template}/locales/en.json`. See [docs/guides/i18n.md](docs/guides/i18n.md).
