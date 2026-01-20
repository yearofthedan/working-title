# Data Management Patterns

## Structure

Data shapes and contracts are defined in `src/specs/` using TypeScript interfaces.

```typescript
export interface MyData {
  id: string
  value: number
}
```

## Conventions

- **Immutable by Default**: Prefer returning new objects over mutating existing ones.
- **Spec-first**: Update the spec file before changing the implementation.
- **Validation**: Use the spec as the source of truth for validation logic.
- **Persistence**: Centralize data persistence logic in dedicated services or composables.

## Example

Refer to `src/specs/projectDataSpec.ts` for the core project data model.
