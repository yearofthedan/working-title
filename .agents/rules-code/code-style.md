# Code Style

## Path Aliases

Use aliases to keep imports clean and readable:

- `@/*` -> `src/*`

## Vue Component Style Guide

### Component Size Limits

- **Guide**: Aim for components under 60 lines.
- **Guideline**: If a component exceeds 100 lines, it should likely be refactored into smaller sub-components or its logic moved to a composable.

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
- **No `any`**: NEVER use the `any` type. Whenever you use an `any` a puppy dies and you're responsible for it. Use real data, use builders, use `unknown` or `never`, or ask for help.
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

### Performance Considerations

- **Exit Early**: Use early returns to reduce nesting and improve readability.
- **Parallelize**: Run independent async operations in parallel using `Promise.all()`.
- **Data Structures**: Choose appropriate data structures (e.g., `Set` or `Map` for fast lookups) when dealing with large datasets.

## Composable Conventions

- **Naming**: Always prefix with `use` (e.g., `useLayout`).
- **Input**: Accept `Ref` or values, using `toValue()` for flexible access.
- **Output**: Return an object containing reactive refs and methods.
