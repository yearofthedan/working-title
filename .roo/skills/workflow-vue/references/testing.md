# Vue Testing Patterns

Tactical implementation details for testing Vue 3 components and composables.

## 1. Composable Testing
Test composables in isolation when they contain complex state or logic.

```typescript
import { describe, it, expect } from 'vitest'
import { useAsyncState } from './useAsyncState'

describe('useAsyncState', () => {
  it('should handle successful state transition', async () => {
    const { state, execute } = useAsyncState(async () => 'success')
    
    expect(state.value).toBe('idle')
    await execute()
    expect(state.value).toBe('success')
  })
})
```

### Complex Composables (Infrastructure & Global State)
Use `runWithComponent` to provide the necessary component lifecycle/context, and `it.scoped` to handle global infrastructure mocks (e.g. logging).

```typescript
import { it } from '@/__testHelpers__/fixtures'
import { runWithComponent } from '@/__testHelpers__/renderer'
import { useNotifications } from './useNotifications'

describe('useNotifications', () => {
  // Use scoped fixtures for global infrastructure mocks
  it.scoped({ globalMocks: ['logging'] })

  it('adds a notification when success is called', () => {
    // Wrap in component context to support provide/inject or lifecycle hooks
    const store = runWithComponent(() => useNotifications())
    
    store.success('Project saved')

    expect(store.notifications.value).toHaveLength(1)
    expect(store.notifications.value[0].message).toBe('Project saved')
  })
})
```

## 2. Component Testing (Browser)
Focus on user interactions and outputs (emits, DOM changes). Use Page Objects to keep tests clean.

```typescript
import { describe, it, expect } from 'vitest'
import { render } from '@/__testHelpers__/renderer'
import ProjectNameDialog from './ProjectNameDialog.vue'
import { ProjectNameDialogObject } from './__testHelpers__/ProjectNameDialogObject'

describe('ProjectNameDialog', () => {
  it('should emit "submit" when save button is clicked', async () => {
    const { user, emitted } = render(ProjectNameDialog)
    const po = new ProjectNameDialogObject(user)

    await po.typeName('My Project')
    await po.clickSave()

    expect(emitted().submit[0]).toEqual(['My Project'])
  })
})
```

## 3. Page Object Pattern
Centralize selectors and interactions. Place in `__testHelpers__` directory.

```typescript
import { type BrowserPage } from 'vitest/browser'

export class ProjectNameDialogObject {
  constructor(private page: BrowserPage) {}

  get input() {
    return this.page.getByRole('textbox', { name: /name/i })
  }

  async typeName(name: string) {
    await this.input.fill(name)
  }

  async clickSave() {
    await this.page.getByRole('button', { name: /save/i }).click()
  }
}
```

## 4. Accessibility (a11y)
- Use accessible locators (`getByRole`, `getByLabel`) in Page Objects.
- Ensure Storybook variants are checked via `addon-a11y`.

## 5. Storybook Play Functions (Tactical Smoke Tests)
Use Storybook play functions for "Render Insurance" and basic interaction verification.

```typescript
export const Success: Story = {
  args: { type: 'success' },
  play: async ({ canvas, step }) => {
    await step('Verify visibility', async () => {
      await expect(canvas.getByRole('alert')).toBeVisible()
    })
  },
}
```
