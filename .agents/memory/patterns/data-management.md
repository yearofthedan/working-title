# Data Management Patterns

## Domain Models

Data shapes and contracts are defined within their respective features using TypeScript interfaces.

- **ProjectData**: Core model for story projects, defined in [`src/features/writing-project/types.ts`](../../../src/features/writing-project/types.ts).
- **ProcessTemplate**: Schema for writing methodologies, defined in [`src/features/process-templates/processTemplate.ts`](../../../src/features/process-templates/processTemplate.ts).

## Conventions

- **Immutable by Default**: Prefer returning new objects over mutating existing ones.
- **Model-first**: Update the type definition before changing the implementation.
- **Single Source of Truth**: Use the domain model as the source of truth for validation logic.
- **Persistence**: Centralize data persistence logic in dedicated services or composables.

## Example

Refer to [`src/features/writing-project/types.ts`](../../../src/features/writing-project/types.ts) for the core project data model.
