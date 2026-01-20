# Vue Component Patterns

## Structure

All components follow the `<template>`, `<script setup>`, `<style>` order.

```vue
<template>
  <div :class="classes">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  variant?: 'primary' | 'secondary'
}>()

const classes = computed(() => [
  'p-4 rounded',
  props.variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500',
])
</script>

<style scoped>
/* Scoped styles only if Tailwind isn't enough */
</style>
```

## Conventions

- **Naming**: `PascalCase` for files and component names.
- **Props**: Use interface-based `defineProps`.
- **Emits**: Use `defineEmits` for custom events.
- **Logic**: Move complex logic to computed properties or composables.
- **Size**: Aim for components under 100 lines. If larger, consider extracting sub-components.

## Example

Refer to `src/features/common/fields/AppTextField.vue` for a clean implementation of a base component.
