# Architecture

## Directory Structure

- `src/utils/`: Pure utility logic (arrays, dates, graphs, objects).
- `src/features/common/`: Global UI primitives and shared components.
- `src/features/[feature-name]/`: Self-contained domain modules.
- `src/specs/`: Type specifications and data contracts.
- `public/`: Static assets.

## Feature Isolation

We want to promote high cohesion and low coupling. Therefore we treat features as modular and isolated.

- **No Cross-Feature Imports**: A feature (e.g., `snowflake`) should RARELY import from the internals of another feature (e.g., `canvas`) and only ever from the root level.
- **Shared only**: If logic or a component is needed by multiple features, it should be moved to `src/features/common/` or `src/utils/`.

## Path Aliases

Use aliases to keep imports clean and readable:

- `@/*` -> `src/*`
- `@features/*` -> `src/features/*`
- `@shared/*` -> `src/specs/*` (Note: points to specs, not features/shared)
- `@common/*` -> configured for `src/common/*` but directory is deprecated; use `@/utils/*` instead.

**CAUTION**: Always verify path aliases in `tsconfig.app.json` and `vite.config.ts` before using as some mappings may be inconsistent.
