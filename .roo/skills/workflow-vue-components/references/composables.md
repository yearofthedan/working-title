# Composable Patterns

- **Trigger**: Extract logic if a component is > 100 lines or logic is shared across 2+ components.
- **Inputs**: Use `MaybeRefOrGetter<T>` for arguments. Always access them via `toValue(arg)` to support refs, getters, and raw values.
- **Outputs**: Always return a plain object of refs/methods. Do not return a single value.
- **Location**: Feature-specific composables must stay in `src/features/[feature]/composables/`.
