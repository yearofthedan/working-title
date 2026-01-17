# Testing

## Methodology

The project uses a combination of unit, component, and interaction testing.

### Tools

- **Vitest**: Primary test runner for unit and component tests.
- **Storybook**: Used for UI documentation and interaction testing via the `play` function.
- **Playwright**: Used by Storybook and Vitest for browser-based testing.

## Testing Patterns

### Test Structure Conventions

Organize test suites with a consistent hierarchy:

```typescript
describe('filename', () => {
  describe('methodName', () => {
    it('does something specific', () => {
      // test implementation
    })

    describe('logical grouping', () => {
      it('handles edge case A', () => {
        // test implementation
      })

      it('handles edge case B', () => {
        // test implementation
      })
    })
  })
})
```

**Structure**:

1. **Outer `describe`**: File or module name (e.g., `'graphs'`, `'useLayout'`)
2. **Method `describe`**: Function or method being tested (e.g., `'partitionNodesByRoot'`)
3. **Logical group `describe`** (optional): Group related test cases when needed
4. **`it` statements**: Individual test cases with clear descriptions

### Test Builders

Use factory functions to create consistent test data for specs and view models.

- **Location**: Look for `__testHelpers__/builders.ts` within features or specs.

### Async Testing

When testing reactive changes or layout calculations, use `vi.waitUntil` to wait for expected states.

```typescript
await vi.waitUntil(() => nodes.value.length > 0)
```

### Storybook Interaction Tests

Use the Storybook `play` function to automate component interactions and verify behavior in the browser. Prefer the 'canvas' property directly.

```typescript
play: async ({ canvas, step, userEvent }) => {
  await step('Example step', async () => {
    const element = await canvas.findByRole('textbox')
    await userEvent.type(element, 'Test content')
    await expect(element).toHaveValue('Test content')
  })
}
```

### Vitest Browser Mode

For integration tests requiring a real browser environment (e.g., navigation, end-to-end component flows, performance assertions):

- **Imports**:
  - `render` from `vitest-browser-vue`
  - `page` from `vitest/browser`
- **Locators**: Use Playwright-style locators via `page.getByText()`, `page.getByRole()`, etc.
- **Assertions**: Use `await expect.element(locator).toBeVisible()`.
- **Async Handling**: Use `await expect.poll(() => ...)` for custom timing assertions.
- **Patterns**: Use Page Objects to encapsulate complex selectors and common navigation tasks.

**When to use**: Multi-page flows, performance assertions, or complex DOM interactions that cross component boundaries.

**When to use Storybook instead**: Isolated component behavior and interaction tests.

#### Example: Page Object Pattern

```typescript
// src/features/[feature]/__testHelpers__/MyPageObject.ts
import { type BrowserPage } from 'vitest/browser'

export class MyPageObject {
  constructor(private page: BrowserPage) {}

  get header() {
    return this.page.getByRole('heading', { name: 'My Page' })
  }
}
```

### Accessibility (a11y)

Ensure components are accessible. Storybook is configured with `addon-a11y` for automated checks.
