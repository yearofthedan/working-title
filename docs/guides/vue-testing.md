# Vue Testing Guide

Tactical patterns for testing Vue 3 components and composables in this project.

## Overview

We use **Vitest** with browser mode for component testing and standard mode for composable testing. The approach follows the Testing Trophy philosophy with an emphasis on sociable tests.

## 1. Composable Testing

Test composables in isolation when they contain complex state or logic.

### Simple Composables

For composables with minimal dependencies:

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

### Complex Composables

For composables requiring component lifecycle or global infrastructure:

```typescript
import { it } from '@/__testHelpers__/fixtures'
import { runWithComponent } from '@/__testHelpers__/renderer'
import { useNotifications } from './useNotifications'

describe('useNotifications', () => {
  // Use scoped fixtures for global infrastructure mocks
  it.scoped({ globalMocks: ['logging'] })

  it('adds a notification when success is called', () => {
    // Wrap in component context for provide/inject or lifecycle hooks
    const store = runWithComponent(() => useNotifications())

    store.success('Project saved')

    expect(store.notifications.value).toHaveLength(1)
    expect(store.notifications.value[0].message).toBe('Project saved')
  })
})
```

**When to use `runWithComponent`:**

- Composable uses `provide/inject`
- Composable depends on component lifecycle hooks
- Composable needs Vue's reactivity system fully initialized

## 2. Component Testing

Focus on user interactions and observable outputs (emits, DOM changes). Always use Page Objects to keep tests clean.

### Basic Component Test

```typescript
import { describe, it, expect } from 'vitest'
import { render } from '@/__testHelpers__/renderer'
import ProjectNameDialog from './ProjectNameDialog.vue'
import { ProjectNameDialogPageObject } from './__testHelpers__/ProjectNameDialogPageObject'

describe('ProjectNameDialog', () => {
  it('should emit "submit" when save button is clicked', async () => {
    const { user, emitted } = await render(ProjectNameDialog)
    const po = new ProjectNameDialogPageObject(user)

    await po.typeName('My Project')
    await po.clickSave()

    expect(emitted().submit[0]).toEqual(['My Project'])
  })
})
```

### Testing with Props

```typescript
it('should display provided project name', async () => {
  const { user } = await render(ProjectNameDialog, {
    props: {
      initialName: 'Existing Project',
      mode: 'edit',
    },
  })
  const po = new ProjectNameDialogPageObject(user)

  expect(await po.getNameValue()).toBe('Existing Project')
})
```

## 3. Page Object Pattern

Centralize selectors and interactions. Place Page Objects in `__testHelpers__/` directory next to the component.

### Basic Page Object

```typescript
import { type BrowserPage } from 'vitest/browser'

export class ProjectNameDialogPageObject {
  constructor(private page: BrowserPage) {}

  get nameInput() {
    return this.page.getByRole('textbox', { name: /name/i })
  }

  get saveButton() {
    return this.page.getByRole('button', { name: /save/i })
  }

  async typeName(name: string) {
    await this.nameInput.fill(name)
  }

  async clickSave() {
    await this.saveButton.click()
  }

  async getNameValue() {
    return this.nameInput.element().value
  }
}
```

### Base Page Object

For shared functionality, extend `BasePageObject`:

```typescript
import { BasePageObject } from '@/features/__testHelpers__/BasePageObject'

export class CanvasStepPageObject extends BasePageObject {
  async clickMenuButton() {
    await this.page.getByRole('button', { name: /menu/i }).click()
  }

  async expectVisible() {
    await this.expectElement(this.page.getByRole('article'))
  }
}
```

## 4. Accessibility Testing

Use accessible locators in Page Objects:

### Preferred Selectors (in order)

1. **`getByRole`** - Best for semantic elements

   ```typescript
   this.page.getByRole('button', { name: /save/i })
   this.page.getByRole('textbox', { name: /project name/i })
   ```

2. **`getByLabel`** - Good for form fields

   ```typescript
   this.page.getByLabel('Project Name')
   ```

3. **`getByText`** - Acceptable for unique text
   ```typescript
   this.page.getByText('Welcome to Working Title')
   ```

### Avoid

- Class selectors (`.btn-primary`)
- Test IDs (`data-testid`) - Only as last resort
- Complex CSS selectors

**Why?** Accessible selectors ensure the UI works with screen readers and keyboard navigation.

## 5. Storybook Integration

Use Storybook play functions for "Render Insurance" - basic verification that states render correctly:

```typescript
import { expect } from '@storybook/test'
import type { Meta, StoryObj } from '@storybook/vue3'

export const Success: StoryObj = {
  args: {
    type: 'success',
    message: 'Project saved',
  },
  play: async ({ canvas, step }) => {
    await step('Verify notification visible', async () => {
      await expect(canvas.getByRole('alert')).toBeVisible()
    })

    await step('Verify success icon shown', async () => {
      const icon = canvas.getByRole('img', { hidden: true })
      await expect(icon).toBeInTheDocument()
    })
  },
}
```

**When to use Storybook tests:**

- Visual state verification
- Basic interaction smoke tests
- Accessibility checks

**When to use Vitest:**

- Logic-heavy tests
- Complex user flows
- Integration with composables

## 6. Test Organization

### File Structure

```
src/features/writing-project/
├── components/
│   ├── SaveIndicator.vue
│   ├── SaveIndicator.spec.ts
│   └── __testHelpers__/
│       └── SaveIndicatorPageObject.ts
├── composables/
│   ├── useProjectLoader.ts
│   └── useProjectLoader.spec.ts
└── __testHelpers__/
    └── builders.ts  (shared test data)
```

### Test Naming

- **Spec files:** `ComponentName.spec.ts` or `composableName.spec.ts`
- **Page Objects:** `ComponentNamePageObject.ts`
- **Builders:** `builders.ts` for shared test data

### Describe Blocks

Organize with clear hierarchy:

```typescript
describe('SaveIndicator', () => {
  describe('when saving', () => {
    it('should show spinner', async () => {
      /* ... */
    })
    it('should disable user actions', async () => {
      /* ... */
    })
  })

  describe('when save succeeds', () => {
    it('should show checkmark', async () => {
      /* ... */
    })
  })
})
```

## 7. Common Patterns

### Testing Emitted Events

```typescript
it('should emit "close" when X button clicked', async () => {
  const { user, emitted } = await render(Dialog)
  const po = new DialogPageObject(user)

  await po.clickClose()

  expect(emitted().close).toBeTruthy()
})
```

### Testing Async Operations

```typescript
it('should show loading state during save', async () => {
  const { user } = await render(ProjectForm)
  const po = new ProjectFormPageObject(user)

  const savePromise = po.clickSave()
  await po.expectLoadingVisible()

  await savePromise
  await po.expectLoadingHidden()
})
```

### Testing i18n

Always use the custom renderer which includes i18n:

```typescript
const { getByText } = await render(HomePage)
expect(getByText('Welcome')).toBeInTheDocument() // Uses t('app.home.welcome')
```

## 8. Test Data (Builders)

Create test data with builders in `__testHelpers__/builders.ts`:

```typescript
export const buildProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'project-1',
  name: 'Test Project',
  templateId: 'snowflake-v1',
  steps: [],
  ...overrides,
})
```

**Usage:**

```typescript
const project = buildProject({ name: 'My Novel' })
const emptyProject = buildProject({ steps: [] })
```

## Troubleshooting

### Test can't find element

**Check:**

1. Is component rendered? Use `screen.debug()` to see DOM
2. Is element accessibility-labeled correctly?
3. Is element hidden by CSS? Use `{ hidden: true }` option

### i18n keys not resolving

**Solution:** Use `render` from `@/__testHelpers__/renderer`, not raw vitest-browser-vue

### Async timing issues

**Solution:** Use `await` with all Page Object methods and `user` interactions

## See Also

- [TDD Patterns](tdd-patterns.md) - RED-GREEN-REFACTOR cycle
- [Architecture: Test Co-location](../architecture.md#4-test-co-location-pageobjects-next-to-components-shared-builders-in-__testhelpers__) - File organization
- [i18n Guide](i18n.md) - Testing with translations
