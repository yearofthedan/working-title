# Skill: Create Page Object

How to build Page Objects for integration and interaction tests.

## When to Use

- Writing integration tests that span multiple components.
- Automating complex UI flows in Storybook or Vitest Browser Mode.
- Ensuring test stability by centralizing selectors.

## Prerequisites

- Familiarity with the target UI and its roles/labels.

## Steps

1. **Directory**: Create or update `__testHelpers__/MyPageObject.ts` in the relevant feature.
2. **Class**: Define a class that accepts the `page` or `canvas` object in its constructor.
3. **Locators**: Add getters for key UI elements using Playwright-style locators (`getByRole`, `getByText`).
4. **Actions**: Add methods for common user actions (e.g., `fillLoginForm`, `clickSubmit`).
5. **Usage**: Import and use the Page Object in your `.spec.ts` or Storybook `play` function.

## Validation Checklist

- [ ] Page Object encapsulates selectors (no hardcoded strings in tests).
- [ ] Methods are descriptive and action-oriented.
- [ ] Tests using the Page Object are readable and stable.

## Common Pitfalls

- Making Page Objects too complex (keep them focused on UI interaction).
- Including assertions inside the Page Object (keep assertions in the test).

## References

- Rules: [Testing](../../.roo/rules-code/testing.md#page-object-pattern)
- Example: `src/features/home/__testHelpers__/HomePageObject.ts`
