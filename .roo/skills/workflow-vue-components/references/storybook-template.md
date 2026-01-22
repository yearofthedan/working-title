# Storybook Component Template

Purpose: Standard boilerplate for component stories with variants and smoke testing.

## Interaction Rules

- **Permutation Coverage**: Export a variant for every functional state (e.g., Success, Error, Loading). This provides "Render Insurance" across the component's surface area.

- **Single Smoke Test**: Define one primary `smokeTest` play function. Its goal is to detect drift between the component and the story.
- **Logic tests**: Do not test complex business logic here. These will be covered by Component Tests (Vitest).

## Template

```
import type { Meta, StoryObj } from '@storybook/vue3'
import { within, expect } from '@storybook/test'
import MyComponent from './MyComponent.vue'

/**
 * Use 'satisfies Meta' to handle generic components
 * and preserve strict types for 'args'.
 */
const meta = {
  component: MyComponent,
  argTypes: {
    // Define controls for variants if necessary
    type: { control: 'select', options: ['success', 'error', 'info'] }
  }
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
  play: runSmokeTest
}

export const Error: Story = {
  args: { type: 'error', message: 'System failure' },
  play: runSmokeTest
}

export const Loading: Story = {
  args: { loading: true },
  play: runSmokeTest
}
```

### Checklist

[ ] Story file is colocated with the component (ComponentName.stories.ts).

[ ] All functional variants are exported.

[ ] Accessible selectors (getByRole, getByText) are used in the play function.

[ ] Shared smokeTest is applied to ensure rendering stability.
