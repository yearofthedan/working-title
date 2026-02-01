---
name: icon-system
description: Add, update, and use Phosphor icons via Iconify with the semantic registry and AppIcon component. Use when working with UI icons or adding new icon usage.
---

# Icon System

This project uses **Phosphor Icons** via the **Iconify** framework with **unplugin-icons** for explicit imports and tree-shaking.

## When to Use

- Adding new icons to the UI
- Updating existing icon usage
- Understanding how to style icons consistently
- Troubleshooting icon-related issues

## Semantic Registry

To maintain consistency and allow for easy global changes, we use a semantic registry in [`src/features/common/icons.ts`](../../../src/features/common/icons.ts).

### Adding/Updating Icons

1. Import the new icon from `~icons/ph/[name]` in [`src/features/common/icons.ts`](../../../src/features/common/icons.ts).
2. Add it to the `icons` object with a descriptive semantic key.

```ts
// src/features/common/icons.ts
import IPhHeart from '~icons/ph/heart'

export const icons = {
  // ...
  favorite: IPhHeart,
} as const
```

## Usage (AppIcon Component)

Use the [`AppIcon`](../../../src/features/common/AppIcon.vue) component to render icons by their semantic name.

```vue
<script setup lang="ts">
import AppIcon from '@/features/common/AppIcon.vue'
</script>

<template>
  <!-- Default weight (Light) styled via Tailwind -->
  <AppIcon name="add" class="text-xl text-ink" />
</template>
```

### Styling

Icons should be styled using Tailwind CSS classes. They inherit `currentColor` and scale with `font-size`.

- **Sizing:** Use `text-*` classes (e.g., `text-xl`).
- **Coloring:** Use theme-aware colors (e.g., `text-primary`, `text-ink`).

## Configuration

- **Framework:** [Iconify](https://iconify.design/)
- **Plugin:** [unplugin-icons](https://github.com/unplugin/unplugin-icons)
- **Primary Set:** [Phosphor Icons](https://phosphoricons.com/)
- **Default Weight:** `light` (configured in [`vite.config.ts`](../../../vite.config.ts))

## Accessibility

[`AppIcon`](../../../src/features/common/AppIcon.vue) automatically adds `aria-hidden="true"` as most icons are decorative. If an icon is used as the primary label for an action (e.g., an icon-only button), ensure the parent element has an appropriate `aria-label`.

## References

- [Icon System Feature Spec](../../../memory/planning/active/icon-system-spec.md)
- [Phosphor Icons Browser](https://phosphoricons.com/)
- [Tech Stack](../../rules/tech-stack.md)
