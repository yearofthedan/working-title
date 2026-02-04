# Styling & Theming (Tailwind v4)

This project uses a Hybrid Styling approach. Brand identity (Colors/Type) is strictly defined in our semantic theme. Layout and spacing use standard Tailwind utilities.

## 1. Color & Identity (Strict)

Never use raw Tailwind colors (e.g., text-zinc-500) for UI elements. Use our semantic tokens (Source: `./style/theme.css`):

- Text: text-ink, text-ink-muted, text-ink-dim.
- Surface: bg-background, bg-paper.
- Actions: text-link, text-error, text-link-hover.
- Dark Mode: Handled automatically via html[data-theme='dark'].

## 2. Typography & Components (Semantic)

Use these component classes (Source: `./styles/typography.css`) instead of stacking multiple text utilities:

- `.label-text`: For field labels (XS, Bold, Tracking-widest, Uppercase).

- `.hint-text`: For help text (XS, Muted).

- `.error-text`: For validation errors (Red, Medium).

- `.field-text`: For standard input values.

## 3. Layout & Spacing (Flexible)

- Spacing: Use standard tailwind utilities (p-4, m-2, gap-6, space-y-4).
- Flexbox: Use our custom @utility shortcuts (Source: `./styles/utilities.css`):
  - flex-h / flex-h-center (Row)
  - flex-y / flex-y-center (Column)

## 4. Hierarchy of Choice

When styling a new element, follow this order:

1. Check Typography/Component Classes: Does a class like .label-text already define this?
2. Use Semantic Theme Variables: If you need a color, is there a --color-ink variant?
3. Default to Tailwind: Use Tailwind for everything else (margins, padding, width, height, etc.).

## 5. Proposing New Typography

If you encounter a recurring visual pattern (e.g., a "Card Title") not covered in typography.css:

1. Do not stack 5+ Tailwind utilities or write a one-off `<style scoped>` if the pattern is repeatable.
2. Action: Propose a new entry for typography.css.
   - Define variables in @theme.
   - Create the component class in @layer components.
   - Ask for confirmation before applying.
