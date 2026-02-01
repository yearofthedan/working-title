---
name: storybook-workflow
description: Create and maintain Storybook stories with variants and smoke testing. Use when adding new components or documenting component states.
---

# Storybook Workflow

Standard boilerplate and interaction rules for component stories with variants and smoke testing.

## When to Use

- Creating a new Vue component
- Documenting functional variants (Loading, Success, Error)
- Adding "Render Insurance" via smoke tests
- Verifying component accessibility via play functions

## Procedure

### 1. File Location

Colocate the story file with the component using the `.stories.ts` extension.
Example: `src/features/common/MyComponent.stories.ts`

### 2. Define Meta

Use `satisfies Meta` to handle generic components and preserve strict types for `args`.

### 3. Implement Variants (Permutation Coverage)

Export a variant for every functional state. This ensures "Render Insurance" across the component's surface area.
Common variants: `Default`, `Loading`, `Error`, `Empty`, `Success`.

### 4. Shared Smoke Test

Define one primary `runSmokeTest` play function. Its goal is to detect drift between the component and the story (e.g., breaking changes in props or template).

- Use accessible selectors (`getByRole`, `getByText`).
- Verify visibility and basic interaction if necessary.
- Do not test complex business logic here (use Vitest for that).

## Template

```typescript
import type { Meta, StoryObj } from '@storybook/vue3'
import { expect } from '@storybook/test'
import MyComponent from './MyComponent.vue'

/**
 * Use 'satisfies Meta' to handle generic components
 * and preserve strict types for 'args'.
 * Note the title prop is NOT provided so that the storybook structure follows the component tree
 */
const meta = {
  component: MyComponent,
  argTypes: {
    // Define controls for variants if necessary
    type: { control: 'select', options: ['success', 'error', 'info'] },
  },
} satisfies Meta<typeof MyComponent>

export default meta
type Story = StoryObj<typeof meta>

/** * SHARED SMOKE TEST
 * Verifies that the component renders and is visible.
 * This catches "white-screen" errors across different prop permutations.
 */
const runSmokeTest: Story['play'] = async ({ canvas, step }) => {
  await step('Verify mount', async () => {
    // Use an accessible role or a generic container
    await expect(canvas.getByRole('alert')).toBeVisible()
  })
}

/** VARIANTS */

export const Success: Story = {
  args: { type: 'success', message: 'Task complete' },
  play: runSmokeTest,
}

export const Error: Story = {
  args: { type: 'error', message: 'System failure' },
  play: runSmokeTest,
}

export const Loading: Story = {
  args: { loading: true },
  play: runSmokeTest,
}
```

## Validation Checklist

- [ ] Story file is colocated with the component (`ComponentName.stories.ts`).
- [ ] All functional variants are exported.
- [ ] Accessible selectors (`getByRole`, `getByText`) are used in the play function.
- [ ] Shared `smokeTest` is applied to ensure rendering stability.

## References

- [workflow-vue-components](../workflow-vue-components/SKILL.md)
- [workflow-general](../workflow-general/SKILL.md)
