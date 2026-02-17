# Architecture

## Guiding Principles

1. **Domain-Driven Design**: Feature modules align with domain boundaries
2. **UI-Centric Canvas Application**: Visual graph editing is the primary interaction model
3. **User Data Ownership**: All project data stays client-side; users control their content

## Directory Structure

- `src/utils/`: Pure utility logic (arrays, dates, graphs, objects)
- `src/features/common/`: Global UI primitives and shared components
- `src/features/[feature-name]/`: Self-contained domain modules
- `public/`: Static assets

## Key Patterns

- **Feature Isolation**: No cross-feature imports
- **Performance**: Async loading for heavy dependencies

## Structural Conventions

These conventions define how code is organized and where different types of logic live:

### 1. Composables are a technique, not a category

Composables live with the concern they serve, not in a generic `composables/` folder. They are a tool for extracting reusable logic, not an architectural layer.

**Example**: `useCanvasViewModel` lives in [`src/features/writing-project/project-canvas/composables/`](../src/features/writing-project/project-canvas/composables/), not in a top-level `src/composables/canvas/` directory.

**Rationale**: Co-location with features makes dependencies explicit and prevents accidental coupling.

### 2. `features/` owns all Vue logic; everything outside is pure TypeScript

The [`src/features/`](../src/features/) directory is the only place Vue components and Vue-specific composables live. Everything outside `features/` must be framework-agnostic TypeScript.

**Example**: Graph algorithms in [`src/utils/graphs.ts`](../src/utils/graphs.ts) have no Vue imports. Vue adapters that consume them live in features.

**Rationale**: Enables testing without Vue, potential framework migration, and clear separation of concerns.

### 3. `infra/` is framework-agnostic (no Vue imports, Vue adapters in features)

The [`src/infra/`](../src/infra/) directory contains infrastructure services (logging, file storage, IndexedDB). These are pure TypeScript modules with no Vue dependencies.

**Example**: [`src/infra/files/FileSystemStorageProvider.ts`](../src/infra/files/FileSystemStorageProvider.ts) uses the File System Access API directly. Vue wrappers live in [`src/features/project-storage/`](../src/features/project-storage/).

**Rationale**: Infrastructure is reusable across any JavaScript context. Vue-specific adapters bridge the gap when needed.

### 4. Test co-location: PageObjects next to components, shared builders in `__testHelpers__/`

Test utilities follow these rules:

- **PageObjects**: Live next to the component they test (e.g., `ComponentName.vue` + `__testHelpers__/ComponentNamePageObject.ts`)
- **Shared test builders/fixtures**: In `__testHelpers__/` at the nearest common ancestor
- **Global test utilities**: In [`src/__testHelpers__/`](../src/__testHelpers__/) (e.g., `builders.ts`, `renderer.ts`)

**Example**: [`src/features/writing-project/project-canvas/canvas-step/__testHelpers__/CanvasStepPageObject.ts`](../src/features/writing-project/project-canvas/canvas-step/__testHelpers__/CanvasStepPageObject.ts) tests [`CanvasStep.vue`](../src/features/writing-project/project-canvas/canvas-step/CanvasStep.vue).

**Rationale**: Tests are first-class code. Co-location reduces cognitive distance and makes test utilities easy to find.

### 5. Skills = imperative procedures; Docs = reference knowledge

- **[`.roo/skills/`](../.roo/skills/)**: Step-by-step workflows for AI agents (e.g., "How to add an icon")
- **[`docs/`](../docs/)**: Reference material for humans (e.g., "Icon system overview")

**Example**: [`.roo/skills/icon-system/SKILL.md`](../.roo/skills/icon-system/SKILL.md) says "Run X, update Y, verify Z". [`docs/guides/icons.md`](guides/icons.md) explains "Icons come from Iconify, registry is at X".

**Rationale**: Different audiences, different formats. Skills are executable; docs are readable.

### 6. Rules = auto-loaded constraints + terminology; full explanations in docs/

- **[`.roo/rules/`](../.roo/rules/)**: Terse, auto-loaded constraints for AI agents (always in context)
- **[`docs/`](../docs/)**: Detailed explanations and rationale (loaded on demand)

**Example**: [`.roo/rules/architecture.md`](../.roo/rules/architecture.md) says "Feature Isolation: No cross-feature imports". [`docs/decisions/active/adr-001-feature-isolation.md`](decisions/active/adr-001-feature-isolation.md) explains why.

**Rationale**: Rules stay small for token efficiency. Docs provide depth when needed.

### 7. Performance: Async loading for heavy dependencies

Heavy dependencies (Tiptap, elkjs) are loaded asynchronously to avoid blocking initial page load.

**Example**: [`src/features/writing-project/composables/useStepEditor.ts`](../src/features/writing-project/composables/useStepEditor.ts) dynamically imports Tiptap only when a step is opened for editing.

**Rationale**: Keeps initial bundle size small and improves time-to-interactive.

## Further Reading

- **[Domain Concepts](domain.md)**: Core terminology and application purpose
- **[Domain Implementation](domain-implementation.md)**: Technical patterns and current template
- **[Architectural Decisions](decisions/)**: Detailed ADRs explaining structural choices
