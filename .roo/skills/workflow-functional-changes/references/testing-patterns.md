# Testing Architecture & Patterns
## 1. Methodology & Structure
Organize all test suites (Vitest or Spec files) with a clear hierarchy to ensure they are readable and easy to debug.

- Outer describe: The file or module name (e.g., 'useLayout').
- Method describe: The specific function or method being tested (e.g., 'updateContent').
- Logical group describe: (Optional) Groups related edge cases.
- it statements: Descriptive, actionable test cases.

```typescript
describe('WritingProject', () => {
  describe('updateStep', () => {
    it('should update step content successfully', () => { /* ... */ })
    
    describe('error states', () => {
      it('should throw if step id is missing', () => { /* ... */ })
    })
  })
})
```

## 2. Test Data Creation (Builders)
Prefer to use builders for test data creation. 

- Place them in the __testHelpers__ folder relative to the src (eg. `src/features/[feature]/__testHelpers__/builders.ts`).
- Naming: Use build<TypeName> (e.g., buildProjectData).
- Pattern: Use Partial<T> and spread ...overrides at the end.

``` typescript
export const buildStep = (overrides: Partial<Step> = {}): Step => ({
  id: 'step-1',
  status: 'active',
  ...overrides,
})
```

## 3. Page Object Pattern
Use Page Objects to centralize selectors and decouple your tests from UI changes.

- Place them in the __testHelpers__ folder relative to the src (eg. `src/features/[feature]/__testHelpers__/[NAME]PageObject.ts`).
- Constraint: Encapsulate selectors; tests should only call semantic methods or getters.
- Prefer compositional page objects to parallel the component tree

```typescript
import { type BrowserPage } from 'vitest/browser'
import TablePageObject from 'path/to/table/_testHelpers/TablePageObject'

export class ProjectPageObject {
  constructor(private page: BrowserPage) {}

  get header() {
    return this.page.getByRole('heading', { name: 'My Page' })
  }

  async clickSave() {
    await this.page.getByRole('button', { name: 'Save' }).click()
  }

  get table() {
    return new TablePageObject(this.page.getByRole('table'))
  }
}
```

4. Accessibility (a11y)
- Automatic: Storybook addon-a11y runs on every variant.
- Manual: Use accessible locators (getByRole, getByLabel) in Page Objects to ensure the UI is navigable by screen readers.

Validation Checklist
[ ] Are builders pure and deterministic (no Math.random)?
[ ] Do Page Objects hide raw CSS/ID selectors?
[ ] Is the test structure following the File > Method > Case hierarchy?
[ ] Are builders and page objects located in the feature's __testHelpers__ directory?