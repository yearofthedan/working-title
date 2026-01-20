# Composable Patterns

Quick reference for established composable approaches.

For comprehensive composable rules, see [Code Style Rules](../../rules-code/code-style.md).

## At a Glance

- **Naming**: Always prefix with `use` (e.g., `useProject`).
- **Input**: Accept `Ref` or values; use `toValue()` for flexible access.
- **Output**: Return an object of reactive refs and functions.
- **Side Effects**: Keep side effects (like API calls) inside composables.

## Example

Refer to `src/features/story/useProjectData.ts` for a robust data-fetching composable.
