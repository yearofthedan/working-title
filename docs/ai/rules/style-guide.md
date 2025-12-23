## Style guide

## Architecture Rules

### Directory Structure

- `src/common/`: Pure utility logic.
- `src/features/shared/`: Global UI primitives.
- `src/features/[feature-name]/`: Self-contained domain modules.
- `docs/ai/rules/`: AI-specific context and rules.
- `public/`: Static assets.

### Feature Isolation

We want to promote high cohesion and low coupling. Therefore we treat features as modular and isolated.

- **No Cross-Feature Imports**: A feature (e.g., `snowflake`) should RARELY import from the internals of another feature (e.g., `canvas`) and only ever from the root level.
- **Shared only**: If logic or a component is needed by multiple features, it should be moved to `src/features/shared/` or `src/common/`.

### Path Aliases

Use aliases to keep imports clean and readable:

- `@features/*` -> `src/features/*`
- `@shared/*` -> `src/features/shared/*`
- `@common/*` -> `src/common/*`

## Vue Component Style Guide

### Naming Conventions

- Vue components should be named in `PascalCase` (e.g., `MyComponent.vue`).
- Component files should match the component name.

### Component Structure and Organization

- **Order of Sections**: The `<script>`, `<template>`, and `<style>` sections should appear in that order within a `.vue` file.

### Template Conventions
- Use `kebab-case` for custom component and prop names in templates.
- Keep templates concise; move complex logic to computed properties, methods, or composables.
