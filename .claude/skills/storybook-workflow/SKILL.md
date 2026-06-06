---
name: storybook-workflow
description: Create and maintain Storybook stories for visual exploration of Vue components in various states. Use whenever working with new states in Vue components.
---

# Storybook Workflow

## Prerequisites

- Vue component patterns: see [`docs/guides/vue-composables.md`](../../../docs/guides/vue-composables.md), [`vue-styling.md`](../../../docs/guides/vue-styling.md), [`vue-testing.md`](../../../docs/guides/vue-testing.md)
- Tooling and `./do` commands: see [`CLAUDE.md`](../../../CLAUDE.md) / [`AGENTS.md`](../../../AGENTS.md)
- **Tools**: Storybook is already configured (`.storybook/preview.ts`)

## In scope

- **Visual documentation** across different interaction states
- Supporting feature development in a component-driven style
- Automated a11y tests via the `@storybook/addon-a11y` plugin

## Out of scope

- A complex design system for designer/developer collaboration
- Unit / behavioural testing (use separate Vitest specs for these)

## When to Use

- Creating a new Vue component, to document its visual variants
- Adding / removing variants from an existing component

## Procedure

### 1. File Location

Stories are colocated with source code and tests, e.g.:

```
features/
  - FooComponent.stories.ts
  - FooComponent.vue
  - FooComponent.spec.ts
```

### 2. Story scope

Export a variant for every significant visual so the UI can be verified across permutations. Example variants: `Default`, `Loading`, `Error`, `Empty`, `Success`.

### 3. Story structure

- Use `satisfies Meta` to type the component and preserve strict types for `args`.
- **Warning**: Do not use play functions. Save complex interaction tests for Vitest specs.
- **Warning**: Skip the `title` prop — Storybook structure should follow the filesystem.
- Most global context is registered in `.storybook/preview.ts`; override / inject in a story only if you need a specific version.
- Aim for terse but readable stories.
- Use existing (or create new) builder functions to reduce boilerplate.
- If uncertain, stop and ask the user. Do NOT make assumptions.

## Template

```typescript
import type { Meta, StoryObj } from '@storybook/vue3'
import MyComponent from './MyComponent.vue'
import { buildPayload } from '@/__testHelpers__/builders'
// Or create feature-specific builders in __testHelpers__/

const meta = {
  component: MyComponent,
  argTypes: {
    type: { control: 'select', options: ['success', 'error', 'info'] },
  },
} satisfies Meta<typeof MyComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    type: 'info',
    message: 'Information message',
  },
}

export const Success: Story = {
  args: {
    type: 'success',
    message: 'Task complete',
    payload: buildPayload({ some: 'value' }),
  },
}

export const Error: Story = {
  args: {
    type: 'error',
    message: 'System failure',
  },
}

export const Loading: Story = {
  args: {
    loading: true,
  },
}
```

## Validation Checklist

- [ ] Story file is colocated with the component (`ComponentName.stories.ts`)
- [ ] Story structure follows the guidance, and any deviation was approved by the user
- [ ] All appropriate variants exist
- [ ] Storybook still runs (`./do storybook`)

## References

- [`.storybook/preview.ts`](../../../.storybook/preview.ts) — global context configuration
- [`docs/guides/vue-testing.md`](../../../docs/guides/vue-testing.md) — component testing patterns
