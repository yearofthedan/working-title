# Skill: Update Component (TDD)

Use this skill when modifying an existing component to ensure stability and correctness.

## When to Use

- Adding new props or features to a component.
- Changing component behavior.
- Refactoring internal component logic.

## Prerequisites

- Existing component and its `.spec.ts` file.
- Dev server or test runner active.

## Steps

1. **Red**: Add a failing test case to the `.spec.ts` file that describes the new behavior.
2. **Verify**: Run the tests and confirm the new test fails as expected.
3. **Green**: Implement the minimum amount of code in the `.vue` file to make the test pass.
4. **Refactor**: Clean up the code and tests while ensuring all tests still pass.
5. **Lint**: Run `./do lint` to ensure code style consistency.

## Validation Checklist

- [ ] New test case passes.
- [ ] All existing tests in the suite pass.
- [ ] No regression in Storybook (if applicable).
- [ ] `./do lint` passes.

## Common Pitfalls

- Mutating props directly (Vue warning).
- Forgetting `await nextTick()` in tests.
- Over-testing internal implementation details instead of public API/UI.

## References

- Patterns: [Testing](../memory/patterns/testing.md)
- Rules: [Testing](../../.roo/rules-code/testing.md)
