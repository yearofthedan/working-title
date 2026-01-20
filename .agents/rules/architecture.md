# Architecture

## Directory Structure

- `src/utils/`: Pure utility logic (arrays, dates, graphs, objects).
- `src/features/common/`: Global UI primitives and shared components.
- `src/features/[feature-name]/`: Self-contained domain modules.
- `public/`: Static assets.

## Architectural Patterns

This project follows several key architectural patterns:

- **[Feature Isolation](../memory/decisions/active/adr-001-feature-isolation.md)**: Modular, self-contained features with no cross-imports.
- **[View Model Pattern](../memory/decisions/active/adr-002-view-model-pattern.md)**: Transform domain data into UI-specific models.
- **[Dormant Components](../memory/decisions/active/adr-003-dormant-components.md)**: Lazy-load heavy dependencies on user interaction.

See individual ADRs for context, decisions, and consequences.

**CAUTION**: Always verify path aliases in `tsconfig.app.json` and `vite.config.ts` before using as some mappings may be inconsistent.

## Performance Patterns

### Async Component Loading

Use `defineAsyncComponent` + `Suspense` for components with heavy dependencies (>1MB) like specialized editors or graph engines. This allows lighter parts of the UI (e.g., sidebars) to render immediately.

### Background Prefetching

Implement proactive background prefetching for primary routes to eliminate navigation latency. Use `router.resolve({ name })` after the initial page is interactive.

### Dormant Third-Party Components

Initialize heavy third-party libraries (e.g., Tiptap, specialized renderers) in lightweight read-only mode during component setup. Activate full functionality only on user interaction (e.g., click-to-edit) to reduce initial CPU and memory overhead.

### Singleton Dependency Management

Encapsulate heavy external libraries behind singleton adapters. This ensures dependencies are loaded exactly once and shared across all consumers.
