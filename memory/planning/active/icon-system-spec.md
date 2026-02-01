# Feature Specification: Icon System with Phosphor Icons

**Status:** Draft  
**Target Mode:** Code  
**Created:** 2026-01-31

## Overview

**What:** Implement a consistent icon system using Phosphor Icons via Iconify framework.

**Why:** Replace inconsistent unicode/AI-generated SVG icons with a professional, tree-shakeable icon library that matches the app's clean, minimal aesthetic.

**Who:** All users interacting with UI elements (buttons, navigation, actions, status indicators).

**Success Criteria:**

- Icons load via Iconify auto-imports with tree-shaking
- Icons use Tailwind classes consistent with existing theme system
- Existing unicode icons replaced with Phosphor equivalents
- Documentation for adding new icons

## Architectural Decisions

### Iconify + unplugin-icons Framework

**Decision:** Use Iconify framework with unplugin-icons Vite plugin.

**Rationale:**

- Tree-shaking ensures only used icons are bundled
- Access to 200+ icon sets (not locked into Phosphor alone)
- Auto-imports eliminate manual import statements
- Simple component usage: `<i-ph-heart />`

**Alternatives Considered:**

- `phosphor-vue` (native): Simpler but locks to single library, chosen approach allows future flexibility

### Phosphor Icons as Primary Set

**Decision:** Use Phosphor Icons as the primary icon library.

**Rationale:**

- Large collection (~9000 icons) suitable for creative/writing tools
- Multiple weights (thin, light, regular, bold, fill, duotone)
- Good domain coverage (document, text, file operations)
- Professional, consistent design system

### Icon Weight Configuration

**Decision:** Configure light weight as default, with access to all weights via suffix.

**Rationale:**

- Light weight matches the app's minimal, clean aesthetic
- Current unicode symbols ('+', '↑', '›') suggest preference for lightweight visuals
- Suffixes (`-light`, `-bold`, `-fill`) allow weight variation when needed

**Usage Pattern:**

```vue
<!-- Default (light) -->
<i-ph-heart class="text-xl text-ink" />

<!-- Other weights via suffix -->
<i-ph-heart-bold class="text-xl text-primary" />
<i-ph-heart-fill class="text-xl text-error" />
```

### Direct Usage Pattern (No Wrapper)

**Decision:** Use auto-imported icon components directly without an `AppIcon` wrapper.

**Rationale:**

- Iconify components are already an abstraction
- Keeps code simple and direct
- Easy to see exactly which icon is used
- Can add wrapper later if patterns emerge that justify it

### Styling via Tailwind

**Decision:** Style icons using Tailwind utility classes, respecting existing CSS custom properties.

**Rationale:**

- Consistent with existing component styling approach
- Theme system already integrated with Tailwind (`text-ink`, `text-primary`, etc.)
- Size control via text sizing (`text-xl`, `text-2xl`)
- No additional abstraction layer needed

## Functional Requirements

### Installation and Configuration

1. Install dependencies:
   - `@iconify/vue`
   - `unplugin-icons` (as dev dependency)
   - `@iconify-json/ph` (Phosphor icon data)

2. Configure Vite plugin in `vite.config.ts`:
   - Enable auto-install for icon data
   - Configure component prefix (default `i-`)
   - Set default collection and variant

3. Configure TypeScript for auto-imports

### Icon Usage

**Standard Usage:**

```vue
<i-ph-plus class="text-xl text-ink" />
<i-ph-arrow-up class="text-lg text-ink-muted" />
<i-ph-caret-right class="text-sm text-primary" />
```

**Sizing:**

- Use Tailwind text size classes: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`
- Icons scale with text size (inherits font-size)

**Coloring:**

- Use theme colors: `text-ink`, `text-ink-muted`, `text-ink-dim`, `text-primary`, `text-error`
- Use Tailwind colors for one-offs: `text-zinc-500`, `text-blue-600`
- Icons inherit `currentColor` by default

**Accessibility:**

- Decorative icons: `aria-hidden="true"`
- Semantic icons: Add `aria-label` or pair with text

### Migration of Existing Icons

Replace current unicode characters in [`HomePage.vue`](../../../src/features/home/HomePage.vue):

| Current | Phosphor Equivalent                       |
| ------- | ----------------------------------------- |
| `+`     | `<i-ph-plus />`                           |
| `↑`     | `<i-ph-arrow-up />` or `<i-ph-upload />`  |
| `›`     | `<i-ph-caret-right />` or `<i-ph-play />` |

Choose based on semantic meaning (arrow = direction, caret = expand, play = start).

## Implementation Steps

1. **Install & Configure** (Priority: High)
   - Add npm dependencies
   - Configure Vite plugin
   - Update TypeScript config

2. **Replace Existing Icons** (Priority: High)
   - Update `HomePage.vue` action cards
   - Test in Storybook stories

3. **Document Usage** (Priority: Medium)
   - Add icon usage guide to project docs or README
   - Include examples of sizing, coloring, weight variants
   - Document how to find/browse available icons

4. **Identify Future Icon Needs** (Priority: Low)
   - Canvas controls (zoom, pan, fit)
   - Editor toolbar (bold, italic, lists)
   - File operations (save, export, delete)
   - Navigation (menu, close, back)

## Edge Cases and Error Handling

### Missing Icon

**Scenario:** Developer references non-existent icon `<i-ph-nonexistent />`

**Handling:**

- Vite will show build warning about missing icon
- Runtime: Component renders empty (graceful degradation)
- Prevention: IDE autocomplete helps discovery

### Performance

**Scenario:** Many icons on single page

**Handling:**

- Tree-shaking ensures only used icons bundled
- Icons are lightweight SVG components
- No runtime penalty vs inline SVGs

## Out of Scope

- Custom icon design/creation (can add later via Iconify)
- Icon animation system (use Tailwind transition utilities as needed)
- Icon sprite generation (Iconify handles optimization)
- Multi-color icons (Phosphor is monochrome; this is a feature not bug)

## Acceptance Criteria

- [ ] Iconify + unplugin-icons installed and configured in Vite
- [ ] Light weight configured as default for Phosphor icons
- [ ] All weights accessible via suffix (`-light`, `-bold`, `-fill`, etc.)
- [ ] TypeScript recognizes auto-imported icon components
- [ ] Existing unicode icons in `HomePage.vue` replaced with Phosphor equivalents
- [ ] Icons styled with Tailwind classes (`text-*` for size, theme colors for color)
- [ ] Icons work in Storybook stories
- [ ] Usage documentation added (where to find icons, how to use different weights)

## Implementation Notes

### Finding Icons

Browse available icons at: https://icon-sets.iconify.design/ph/

### Component Naming Pattern

Iconify converts icon names to component format:

- Icon set: `ph` (Phosphor)
- Icon name: `arrow-up`
- Component: `<i-ph-arrow-up />`
- Weight suffix: `<i-ph-arrow-up-bold />`

### Integration with Existing Components

Icons should work seamlessly with existing components:

- Buttons: Place icon beside or instead of text
- Cards: Use in `HomeActionCard` icon slot
- Status indicators: Pair with loading states
- Navigation: Menu items, breadcrumbs

### Future Extensibility

If custom icons needed later:

1. Create SVG in `src/assets/icons/custom/`
2. Configure unplugin-icons to load custom collection
3. Use same pattern: `<i-custom-my-icon />`

### Tailwind v4 Compatibility

Icons work with CSS custom properties:

```css
/* Theme vars already in Tailwind config */
--color-ink: var(--color-zinc-950);
--color-primary: var(--color-blue-700);

/* Applied via Tailwind utilities */
<i-ph-heart class="text-ink" />
```

## References

- [Iconify Documentation](https://iconify.design/)
- [unplugin-icons](https://github.com/unplugin/unplugin-icons)
- [Phosphor Icons](https://phosphoricons.com/)
- [Icon Browser](https://icon-sets.iconify.design/ph/)
