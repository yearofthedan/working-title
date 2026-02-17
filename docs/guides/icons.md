# Icon System Guide

This project uses **Phosphor Icons** via the **Iconify** framework with **unplugin-icons** for explicit imports and tree-shaking.

## Overview

Icons are managed through a semantic registry that provides:

- Consistent icon usage across the application
- Easy global icon changes
- Type-safe icon references
- Automatic tree-shaking

## Adding New Icons

### 1. Import the Icon

Add the import to [`src/features/common/icons.ts`](../../src/features/common/icons.ts):

```typescript
import IPhHeart from '~icons/ph/heart'
```

### 2. Add to Semantic Registry

Add the icon with a descriptive semantic key:

```typescript
export const icons = {
  // ...existing icons
  favorite: IPhHeart,
} as const
```

**Why semantic names?** Using `favorite` instead of `heart` allows you to change the icon globally without updating every usage site.

## Using Icons

Use the [`AppIcon`](../../src/features/common/AppIcon.vue) component with semantic names:

```vue
<script setup lang="ts">
import AppIcon from '@/features/common/AppIcon.vue'
</script>

<template>
  <!-- Default weight (Light) styled via Tailwind -->
  <AppIcon name="add" class="text-xl text-ink" />

  <!-- With semantic color -->
  <AppIcon name="close" class="text-2xl text-error" />
</template>
```

## Styling Icons

Icons inherit `currentColor` and scale with `font-size`. Use Tailwind classes:

### Sizing

Use `text-*` utility classes:

- `text-base` (16px) - Default body text size
- `text-lg` (18px) - Slightly larger
- `text-xl` (20px) - Common for UI icons
- `text-2xl` (24px) - Emphasized icons

### Coloring

Use semantic color tokens (see [styling guide](vue-styling.md)):

- `text-ink` - Primary text color
- `text-ink-muted` - Secondary text
- `text-link` - Interactive elements
- `text-error` - Error states

**Never use raw colors** like `text-blue-500` or `text-red-600`.

## Accessibility

The [`AppIcon`](../../src/features/common/AppIcon.vue) component automatically adds `aria-hidden="true"` because most icons are decorative.

### Icon-Only Buttons

If an icon is the primary label for an action, ensure the parent element has proper labeling:

```vue
<button aria-label="Delete project">
  <AppIcon name="delete" class="text-xl" />
</button>
```

## Configuration

- **Framework:** [Iconify](https://iconify.design/)
- **Plugin:** [unplugin-icons](https://github.com/unplugin/unplugin-icons)
- **Primary Set:** [Phosphor Icons](https://phosphoricons.com/)
- **Default Weight:** `light` (configured in [`vite.config.ts`](../../vite.config.ts))

## Finding Icons

Browse available icons at [phosphoricons.com](https://phosphoricons.com/).

The import path follows this pattern:

```typescript
import IPhIconName from '~icons/ph/icon-name'
```

Convert the icon name from the browser to kebab-case for the import.

## See Also

- [Tech Stack](../tech-stack.md) - Icon libraries overview
- [Vue Styling Guide](vue-styling.md) - Color and theming system
