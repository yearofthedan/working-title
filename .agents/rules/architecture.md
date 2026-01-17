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

**CAUTION**: Always verify path aliases in `tsconfig.app.json` and `vite.config.ts` before using as some mappings may be inconsistent.

## Architectural Patterns

### View Model Pattern

Separate data transformation logic from components by creating dedicated view models. This keeps components focused on rendering and user interaction.

- **Location**: Typically found in feature-specific `composables/`.
- **Purpose**: Transform raw project data into view-specific models
- **Example**: Canvas (Steps → Graph nodes) vs Sidebar (Steps → Ordered list)

See [`src/features/story-canvas/composables/useProjectViewModel.ts`](../../src/features/story-canvas/composables/useProjectViewModel.ts)

### Specification Pattern

Use dedicated spec files to define data shapes and contracts used across the application.

## Performance Patterns

### Async Component Loading

Use `defineAsyncComponent` + `Suspense` for components with heavy dependencies (>1MB) like specialized editors or graph engines. This allows lighter parts of the UI (e.g., sidebars) to render immediately.

### Background Prefetching

Implement proactive background prefetching for primary routes to eliminate navigation latency. Use `router.resolve({ name })` after the initial page is interactive.

### Dormant Third-Party Components

Initialize heavy third-party libraries (e.g., Tiptap, specialized renderers) in lightweight read-only mode during component setup. Activate full functionality only on user interaction (e.g., click-to-edit) to reduce initial CPU and memory overhead.

### Singleton Dependency Management

Encapsulate heavy external libraries behind singleton adapters. This ensures dependencies are loaded exactly once and shared across all consumers.

- **Location**: `src/specs/`
- **Purpose**: Define type specifications and data contracts
- **Examples**: `projectDataSpec.ts`, `processTemplateSpec.ts`
