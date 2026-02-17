# Vue Styling Guide

This project uses Tailwind CSS v4 with a hybrid approach: semantic tokens for brand identity and standard utilities for layout.

## Core Philosophy

**Brand identity (colors, typography) is strictly defined.** Layout and spacing use standard Tailwind utilities.

This balance provides:

- Consistent visual identity across the app
- Easy dark mode support
- Flexibility for layout adjustments
- Type-safe theme system

## 1. Colors (Strict - Use Semantic Tokens)

**Never use raw Tailwind colors** like `text-zinc-500`, `bg-blue-500` for UI elements.

### Semantic Color Tokens

Defined in [`src/styles/theme.css`](../../src/styles/theme.css):

#### Text Colors

- `text-ink` - Primary text color
- `text-ink-muted` - Secondary text (less emphasis)
- `text-ink-dim` - Tertiary text (minimal emphasis)
- `text-link` - Interactive text/links
- `text-link-hover` - Link hover state
- `text-error` - Error messages

#### Background Colors

- `bg-background` - Main app background
- `bg-paper` - Card/panel surfaces
- `bg-paper-hover` - Hoverable surface state

#### Border Colors

- `border-default` - Standard borders
- `border-subtle` - Light borders

### Dark Mode

Dark mode is automatic. Using semantic tokens ensures components adapt:

```vue
<div class="bg-paper text-ink">
  <!-- Automatically adjusts for light/dark mode -->
</div>
```

Theme is controlled via `html[data-theme='dark']` attribute.

### Examples

✅ **Correct:**

```vue
<button class="bg-paper text-ink hover:bg-paper-hover">
  Click me
</button>
```

❌ **Wrong:**

```vue
<button class="bg-white text-gray-900 hover:bg-gray-100">
  Click me
</button>
```

## 2. Typography (Use Component Classes)

Typography component classes are defined in [`src/styles/main.css`](../../src/styles/main.css).

### Available Classes

- **`.label-text`** - Form field labels
  - Extra small, bold, uppercase, wide tracking
  - Use for input labels, section headers

- **`.hint-text`** - Helper text
  - Extra small, muted color
  - Use for placeholders, instructions

- **`.error-text`** - Validation errors
  - Small, error color, medium weight
  - Use for form validation messages

- **`.field-text`** - Input values
  - Standard size and weight
  - Use for text inputs, selects

### Examples

```vue
<template>
  <div>
    <label class="label-text"> Project Name </label>
    <input class="field-text" />
    <p class="hint-text">Choose a unique name for your project</p>
    <p class="error-text" v-if="error">Name is required</p>
  </div>
</template>
```

### Why Component Classes?

Instead of stacking multiple utilities:

❌ **Avoid:**

```vue
<label class="text-xs font-bold uppercase tracking-widest text-ink-muted">
  Project Name
</label>
```

✅ **Prefer:**

```vue
<label class="label-text">
  Project Name
</label>
```

Benefits:

- Consistent typography across app
- Easy global updates
- Less class clutter

## 3. Layout & Spacing (Flexible - Use Tailwind)

Standard Tailwind utilities for layout:

### Spacing

```vue
<div class="p-4 m-2 gap-6 space-y-4">
  <!-- padding, margin, gap, space between -->
</div>
```

### Flexbox Shortcuts

Custom utilities in [`src/styles/main.css`](../../src/styles/main.css):

- **`flex-h`** - Horizontal flex row with gap
- **`flex-h-center`** - Horizontal, centered
- **`flex-y`** - Vertical flex column with gap
- **`flex-y-center`** - Vertical, centered

```vue
<template>
  <!-- Horizontal layout -->
  <div class="flex-h gap-4">
    <button>Cancel</button>
    <button>Save</button>
  </div>

  <!-- Vertical centered -->
  <div class="flex-y-center gap-2">
    <AppIcon name="info" />
    <p>Information message</p>
  </div>
</template>
```

### Grid

```vue
<div class="grid grid-cols-2 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
</div>
```

## 4. Decision Hierarchy

When styling an element, follow this order:

1. **Typography Classes** - Does `.label-text`, `.hint-text`, etc. apply?
2. **Semantic Colors** - Use `text-ink`, `bg-paper`, etc.
3. **Tailwind Utilities** - Use for layout, spacing, sizing

### Example Application

```vue
<template>
  <div class="bg-paper p-6 rounded-lg">           <!-- Semantic BG + Tailwind utilities -->
    <h2 class="text-ink text-xl font-bold mb-4">  <!-- Semantic color + Tailwind size -->
      Project Settings
    </h2>

    <label class="label-text">                     <!-- Typography class -->
      Project Name
    </label>

    <input
      class="field-text w-full border border-default rounded px-3 py-2"
      <!-- Typography + Semantic border + Tailwind layout -->
    />
  </div>
</template>
```

## 5. Proposing New Typography Classes

If you encounter a recurring visual pattern not covered by existing classes:

### Don't

- Stack 5+ Tailwind utilities repeatedly
- Write one-off `<style scoped>` for repeatable patterns

### Do

1. Identify the pattern (e.g., "Card title", "Button label")
2. Define variables in `@theme` section of CSS
3. Create class in `@layer components`
4. Get confirmation before applying globally

**Example proposal:**

```css
/* src/styles/main.css */

@theme {
  --font-size-card-title: 1.125rem;
  --font-weight-card-title: 600;
}

@layer components {
  .card-title {
    font-size: var(--font-size-card-title);
    font-weight: var(--font-weight-card-title);
    color: var(--color-ink);
    line-height: 1.5;
  }
}
```

## 6. Component Scoped Styles

Prefer utility classes over scoped styles when possible.

### When to Use Scoped Styles

Only for:

- Complex animations/transitions
- Third-party library overrides
- Truly unique one-off styles

```vue
<template>
  <div class="custom-animation bg-paper p-4">Content</div>
</template>

<style scoped>
.custom-animation {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
```

## 7. Accessibility Considerations

### Color Contrast

Semantic tokens are designed with WCAG AA contrast ratios:

- `text-ink` on `bg-paper` ≥ 4.5:1
- `text-ink-muted` on `bg-paper` ≥ 3:1

### Focus States

Always style focus states for keyboard navigation:

```vue
<button class="focus:outline-none focus:ring-2 focus:ring-link">
  Accessible Button
</button>
```

## Common Patterns

### Card/Panel

```vue
<div class="bg-paper border border-default rounded-lg p-6">
  <h3 class="text-ink text-lg font-semibold mb-3">Card Title</h3>
  <p class="text-ink-muted">Card content goes here.</p>
</div>
```

### Form Field

```vue
<div class="space-y-2">
  <label class="label-text">Field Label</label>
  <input 
    class="field-text w-full border border-default rounded px-3 py-2 bg-paper text-ink"
  />
  <p class="hint-text">Optional helper text</p>
</div>
```

### Button Primary

```vue
<button class="bg-link text-white hover:bg-link-hover px-4 py-2 rounded font-medium">
  Primary Action
</button>
```

### Button Secondary

```vue
<button class="bg-paper text-ink hover:bg-paper-hover border border-default px-4 py-2 rounded">
  Secondary Action
</button>
```

## Validation Checklist

Before committing styled components:

- [ ] Used semantic tokens for colors (no `text-blue-500`, `bg-gray-100`)
- [ ] Used typography classes where applicable (`.label-text`, `.hint-text`)
- [ ] Used Tailwind utilities for layout and spacing
- [ ] Styled focus states for accessibility
- [ ] Tested in both light and dark mode (if applicable)
- [ ] No unnecessary `<style scoped>` blocks

## See Also

- [Icon System](icons.md) - Icon styling follows same color token pattern
- [Architecture](../architecture.md) - Structural conventions
- [Tech Stack](../tech-stack.md) - Tailwind v4 configuration
