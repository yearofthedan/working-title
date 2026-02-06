---
name: storybook-workflow
description: Create and maintain Storybook stories for visual exploration of Vue Components in various states. Use whenever working with new states in Vue Components.
---

# Storybook Workflow

## Prerequisites

**Required Context Skills**:

- Load [`workflow-vue`](../workflow-vue/SKILL.md) for component patterns
- Load [`workflow-general`](../workflow-general/SKILL.md) for tooling setup

**Tools**: Storybook already configured in project (`.storybook/preview.ts`)

## In scope

- Used for **visual documentation** across different interaction states
- Used to support feature development in a component driven development style
- Used for automated a11y tests via the `@storybook/addon-a11y` plugin

## Out of scope

- Use as a complex design system for collaboration between designers and developers
- Use for unit / behavioural testing (use separate vitest specs for these)

## When to Use

- When creating a new Vue component to document its visual variants.
- When adding / removing variants from an existing component.

## Procedure

### 1. File Location

- Stories are always colocated with source code and tests, eg.

```
\features
  - FooComponent.stories.ts
  - FooComponent.vue
  - FooComponent.spec.ts
```

### 2. Story scope

- Export a variant for every significant visual. This allows for manual verification of the component's UI across permutations. Example variants: `Default`, `Loading`, `Error`, `Empty`, `Success`.

### 3. Story structure

- Use `satisfies Meta` to handle components and preserve strict types for `args`.
- **Warning**: Do not use play functions. Save complex interaction tests for Vitest specs.
- **Warning**: Skip the `title` prop—Storybook structure should follow filesystem
- Most global context is already registered in `./storybook/preview.ts`. If you need specific versions, you can override / inject this in your stories.
- Aim for terse but readable stories.
- Use existing (or create new) builder functions to reduce boilerplate
- If uncertain, stop and ask the user for guidance. DO NOT make assumptions.

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

- [ ] Story file is colocated with the component (`ComponentName.stories.ts`).
- [ ] Story structure follows guidance, and where it does not has been approved by the user
- [ ] All appropriate variants of the story exist
- [ ] Storybook still runs (`./do storybook`)

## References

- [`workflow-vue`](../workflow-vue/SKILL.md) - Component organization and testing patterns
- [`workflow-general`](../workflow-general/SKILL.md) - Commit standards and tooling
- [.storybook/preview.ts](../../.storybook/preview.ts) - Global context configuration
