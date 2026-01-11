# Styling

## Tailwind CSS v4

The project uses Tailwind CSS v4 for styling.

### Methodology

- **Utility-First**: Use Tailwind utility classes directly in templates for most styling needs.
- **Custom CSS Variables**: Use CSS variables for theme-related values (e.g., `var(--color-background)`).
- **CSS Import Syntax**: Tailwind is imported via `@import 'tailwindcss';` in the main CSS file.

### File Organization

- `src/styles/main.css`: Entry point importing Tailwind and other style files.
- `src/styles/theme.css`: Custom theme colors and design tokens using CSS variables.
- `src/styles/typography.css`: Base typography styles.
- `src/styles/utilities.css`: Custom utility classes not covered by Tailwind.

### Conventions

- Prefer Tailwind utilities over custom CSS classes when possible.
- Use the `@layer` directive in CSS files to organize base, component, and utility styles.
- Ensure colors and spacing follow the defined theme in `theme.css`.
