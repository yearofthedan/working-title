# working-title

Vue 3 + Vite + TypeScript SPA. The purpose, architecture, and stack live in the imported docs below; **this file holds only the hard rules not stated there.** Current work and workflow (handoff → /spec → /slice) are in `docs/handoff.md`.

@docs/architecture.md
@docs/domain.md
@docs/tech-stack.md

## Hard rules

- **`./do` is the entry point.** Run tasks through `./do <cmd>`, never the underlying tools. `./do check` is the aggregate gate (lint + build + test); `./do e2e` is separate (slow, runs at Done-when).
- **pnpm, exact versions.** `engine-strict` is on; dependencies are pinned exact — no `^`/`~`. Don't bump versions outside a deliberate, reviewed change.
- **TDD-first.** Write the failing test before the implementation.
- **Conventional commits, one-line subjects, no padded bodies.** e.g. `feat(canvas): …`, `chore: …`, `docs(specs): …`.
