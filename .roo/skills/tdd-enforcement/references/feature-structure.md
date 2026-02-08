# Feature Module Architecture

## 1. Core Principles

- Vertical Isolation: Features must be self-contained in src/features/[feature-name]/.
- Zero Cross-Imports: A feature cannot import from another feature.
- Allowed Dependencies: Features may only import from src/utils/, src/features/common/, or their own internal files.

## 2. Evolutionary Structure

Do not pre-create complex hierarchies. Start flat and expand as the feature grows.
```
src/features/my-feature/
├── **testHelpers**/ # MANDATORY: Builders and Page Objects
├── [Feature]Page.vue # Route entry point
├── [Feature]Main.vue # Primary component
└── types.ts # Local domain types
```
As complexity increases, add standard subdirectories:

- components/: UI slices used within the feature.
- composables/: Business logic and reactive state.
- [sub-feature/]: Grouping of complex sub-feature

## 3. Test Helpers (Required)

Every feature must have a **testHelpers**/ directory. This decouples test-specific logic from production code.

- Builders: Factory functions using Partial<T> for mock data.
- Page Objects: Centralized selectors for Vitest Browser or Playwright tests.

## 4. Integration

- Routing: Features are integrated via `src/router/routes.ts` using dynamic imports for lazy loading.
- Tests: .spec.ts files should sit alongside the implementation (e.g., MyComponent.vue and MyComponent.spec.ts).

## 5. Summary Checklist

- [ ] Is it in a kebab-case folder in src/features/?
- [ ] Does it have a **testHelpers**/builders.ts file?
- [ ] Are there zero imports from other feature directories?
- [ ] Are thin, functional slices built and tested first (Vertical Slicing)?
