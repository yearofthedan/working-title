# Code Style

## Path Aliases

Use aliases to keep imports clean and readable:

- `@/*` -> `src/*`
- `@features/*` -> `src/features/*`
- `@specs/*` -> `src/specs/*`
- `@common/*` -> configured for `src/common/*` but directory is deprecated; use `@/utils/*` instead.

## Vue Component Style Guide

### Naming Conventions

- Vue components should be named in `PascalCase` (e.g., `MyComponent.vue`).
- Component files should match the component name.

### Component Structure and Organization

- **Order of Sections**: The `<template>`, `<script setup>`, and `<style>` sections should appear in that order within a `.vue` file.
- **Composition API**: Use `<script setup>` for all components.

### Template Conventions

- Use `kebab-case` for custom component and prop names in templates.
- Keep templates concise; move complex logic to computed properties, methods, or composables.

### TypeScript Type Safety

- **No Type Casting**: Avoid type casting (e.g., `as SomeType`) whenever possible.
- **No `any`**: Never use the `any` type. Use `unknown` instead of `any` for values whose type is not yet known.
- **Real Types**: Use specific, real types for all variables, properties, and function signatures.

### Comments

- Avoid comments unless absolutely necessary.
- Prefer clear method and variable names over explanatory comments.
- Use comments only when:
  - Explaining non-obvious business logic or domain constraints.
  - Documenting workarounds for known issues.
  - Providing context that cannot be expressed through code structure.

## Vue Composition API Patterns

### Generic Components

Use the `generic` attribute on `<script setup>` for type-safe components that handle various data types.

```vue
<script setup lang="ts" generic="T extends SomeBaseType">
defineProps<{ data: T }>()
</script>
```

### v-model with defineModel

Use the `defineModel` macro for cleaner two-way data binding.

```typescript
const modelValue = defineModel<string>({ required: true })
```

### Component Options with defineOptions

Use `defineOptions` to set component properties like `inheritAttrs`.

```typescript
defineOptions({
  inheritAttrs: false,
})
```

### Performance Optimization

- **shallowRef**: Use for large objects or collections where you only need to track reference changes, especially when integrating with external libraries like Vue Flow or elkjs.
- **Debouncing**: Use `useDebounceFn` from VueUse for expensive calculations like graph layout.

## Composable Conventions

- **Naming**: Always prefix with `use` (e.g., `useLayout`).
- **Input**: Accept `Ref` or values, using `toValue()` for flexible access.
- **Output**: Return an object containing reactive refs and methods.
