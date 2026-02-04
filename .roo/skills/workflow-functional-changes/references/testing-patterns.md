# Testing Strategy & Structure

Strategic guidance for building a robust, maintainable test suite using the **Testing Trophy** philosophy.

## 1. Testing Trophy
We prioritize tests that provide the most "bang for your buck" in terms of confidence vs. effort.

- **Static**: Catch typos and type errors (TypeScript, ESLint).
- **Unit (Sociable)**: The bulk of our suite. Focus on logic and behavior. Includes **Component Tests** which we treat as sociable unit tests.
- **Integration**: Verify multiple modules or a full feature flow (Journey tests).
- **E2E**: Verify the entire system from the user's perspective (Playwright).

## 2. Sociable Testing
Prefer "sociable" tests that use real collaborators over "solitary" tests that mock everything. 
- **Goal**: Test the unit and its dependencies together to ensure they actually work in concert.
- **Exceptions**: Only mock external APIs, heavy infrastructure, or non-deterministic code.

## 3. Methodology & Structure
Organize all test suites with a clear hierarchy.

- Outer `describe`: The file or module name.
- Method `describe`: The specific function or method being tested.
- `it` statements: Descriptive, actionable test cases.

```typescript
describe('WritingProject', () => {
  describe('updateStep', () => {
    it('should update step content successfully', () => { /* ... */ })
  })
})
```

## 4. Test Data Creation (Builders)
Use builders to create deterministic test data and decouple tests from schema changes.

- **Location**: `src/features/[feature]/__testHelpers__/builders.ts`
- **Pattern**: Use `Partial<T>` and spread overrides.

```typescript
export const buildStep = (overrides: Partial<Step> = {}): Step => ({
  id: 'step-1',
  status: 'active',
  ...overrides,
})
```

## 5. Tactical Patterns
For specific implementation examples, see:
- [Vue Testing Patterns](../../workflow-vue/references/testing.md) (Components, Composables, Page Objects)
- [Storybook Workflow](../../storybook-workflow/SKILL.md) (Smoke tests)
