# Advanced Patterns

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

## Data Management Patterns

### View Model Pattern

Separate data transformation logic from components by creating dedicated view models. This keeps components focused on rendering and user interaction.

- **Location**: Typically found in feature-specific `composables/`.

### Specification Pattern

Use dedicated spec files to define data shapes and contracts used across the application.

- **Location**: `src/specs/`.

## Composable Conventions

- **Naming**: Always prefix with `use` (e.g., `useLayout`).
- **Input**: Accept `Ref` or values, using `toValue()` for flexible access.
- **Output**: Return an object containing reactive refs and methods.
