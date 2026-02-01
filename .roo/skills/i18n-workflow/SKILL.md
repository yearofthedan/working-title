---
name: i18n-workflow
description: Work with the two-tier i18n system using vue-i18n. Add static app strings and template-specific strings. Use when adding user-facing text or internationalizing features.
---

# i18n Workflow

This guide explains how to work with the internationalization (i18n) system in this project. We use `vue-i18n` (v9) for managing all user-facing strings.

## When to Use

- Adding new user-facing text to the UI
- Internationalizing a new feature
- Understanding the two-tier i18n architecture
- Troubleshooting missing translation keys
- Testing components with i18n

## Overview: Two-Tier System

Our i18n system is split into two layers to maintain feature isolation and optimize bundle size:

1. **Static App Strings**: Global UI elements, navigation, and common errors. Loaded at application startup.
2. **Template Strings**: Strings specific to a writing methodology (e.g., Snowflake). Loaded lazily only when a project using that template is opened.

## Adding Static App Strings

Static strings belong in the core application and are shared across all views.

### 1. Update Locale File

Add your key-value pair to [`src/locales/en.json`](../../../src/locales/en.json). Follow the existing hierarchy:

```json
{
  "app": {
    "myFeature": {
      "buttonLabel": "Click Me"
    }
  }
}
```

### 2. Update TypeScript Schema

To maintain autocomplete and type safety, you MUST update [`src/locales/types.ts`](../../../src/locales/types.ts) to match the JSON structure:

```typescript
export interface MessageSchema {
  app: {
    myFeature: {
      buttonLabel: string
    }
  }
  // ...
}
```

### 3. Use in Components

Use the `useI18n` composable in your Vue components:

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <button>{{ t('app.myFeature.buttonLabel') }}</button>
</template>
```

## Adding Template Strings

Template strings are specific to a domain feature (a writing process template).

### 1. Update Template Locale File

Add strings to the `en.json` file within the template's directory, e.g., [`src/features/process-templates/snowflake/locales/en.json`](../../../src/features/process-templates/snowflake/locales/en.json).

**Important**: All template strings must reside under the `template.*` namespace.

```json
{
  "template": {
    "step": {
      "myNewStep": {
        "label": "My New Step",
        "instruction": "Do this thing..."
      }
    }
  }
}
```

### 2. Namespace Conventions

To keep the global namespace clean and organized, follow these prefixes:

| Namespace | Usage | Example Key |
| :--- | :--- | :--- |
| `app.*` | Core UI, navigation, layouts | `app.home.title` |
| `common.*` | Reusable UI labels (Save, Cancel, Close) | `common.actions.save` |
| `errors.*` | System-level error messages | `errors.generic` |
| `template.*` | Everything related to a process template | `template.step.summary.label` |

## Testing with i18n

Our test environment is pre-configured to handle i18n.

1. **Use the Custom Renderer**: Always use the `render` or `runWithComponent` helpers from [`@testHelpers/renderer`](../../../src/__testHelpers__/renderer.ts).
2. **Automatic Context**: These helpers automatically inject a `testI18n` instance containing both app strings and Snowflake template strings.

```typescript
import { render } from '@testHelpers/renderer'
import MyComponent from './MyComponent.vue'

test('renders translated text', async () => {
  const { getByText } = await render(MyComponent)
  // t('app.home.title') will resolve correctly
  expect(getByText('Working Title')).toBeInTheDocument()
})
```

## Common Patterns

### Buttons and Actions

Prefer keys in `common.actions.*` for standard buttons to ensure consistency.
```vue
<button>{{ t('common.actions.save') }}</button>
```

### Placeholders and Instructions

Use specific keys for form inputs to allow for detailed guidance.
```vue
<AppTextField
  :label="t('template.step.genre.label')"
  :placeholder="t('template.step.genre.placeholder')"
/>
```

### Dynamic Messages (Named Interpolation)

If you need dynamic values, use named interpolation in your JSON:
```json
"welcome": "Hello, {name}!"
```
```typescript
t('app.welcome', { name: 'Writer' })
```

## Common Pitfalls

**Missing Translation Keys**
- **Issue**: UI shows the raw key (e.g., `app.home.title`)
- **Solution**: Ensure it exists in [`src/locales/en.json`](../../../src/locales/en.json) and spelling is exact. Template strings must be prefixed with `template.`.

**TypeScript Errors**
- **Issue**: `t()` doesn't autocomplete or flags valid keys as errors
- **Solution**: Update the `MessageSchema` in [`src/locales/types.ts`](../../../src/locales/types.ts) to match the JSON structure.

**`useI18n must be called in setup()`**
- **Issue**: This composable only works inside Vue components
- **Solution**: For utility functions or outside of components, use the global instance: `import { i18n } from '@/i18n'; i18n.global.t('key')`.

**Tests Failing with Missing Keys**
- **Issue**: Tests can't resolve translation keys
- **Solution**: Always use the custom `render` from [`@testHelpers/renderer`](../../../src/__testHelpers__/renderer.ts) instead of the base `vitest-browser-vue` one.

## Validation Checklist

- [ ] Added key to appropriate locale file (`src/locales/en.json` or template `locales/en.json`)
- [ ] Updated TypeScript schema in `src/locales/types.ts` (if static app string)
- [ ] Used correct namespace (`app.*`, `common.*`, `errors.*`, or `template.*`)
- [ ] Tested in component with `useI18n`
- [ ] Verified tests pass with custom renderer

## References

- [Domain Concepts](../../rules/domain.md)
- [ADR-006: i18n Architecture](../../../memory/decisions/active/adr-006-i18n-architecture.md)
- [Tech Stack](../../rules/tech-stack.md)
