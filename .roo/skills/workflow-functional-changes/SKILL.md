---
name: workflow-functional-changes
description: PROCESS workflow for feature development. Covers vertical slicing, TDD (red-green-refactor), and testing strategy. Complements workflow-general (tooling) and workflow-vue-components (implementation).
---

## When to Use

- Implementing new features or modifying existing functionality
- Adding or updating components, composables, or utility functions
- Running TDD cycles (red-green-refactor)
- Verifying code changes before commit
- Optimizing test performance and coverage

## Prerequisites

- Start from a clean state with all tests passing.
- Ensure a understanding of the vertical slice to be implemented. If there are any questions, ask the user for clarification.

## Procedure

### 1. Vertical Slicing

- Build thin, functional slices that are testable and committable.
- Avoid building large parts in isolation; wire up components to their data source as soon as possible.
- Use Branch by Abstraction: Build new components or pages and test them in Storybook/Vitest before registering them in the main router.

### 2. TDD Cycle (Red-Green-Refactor)

1. Red: Write a failing test for the specific behavior. Run it to confirm failure.
2. Green: Write the minimum code required to pass the test.
3. Refactor: Clean up the code while keeping the test green.

### 3. Testing Strategy
More detail at [Testing patterns](references/testing-patterns.md)

- Unit (Vite): Low-level logic, utility functions, simple composables.
- Component (Vite Browser): Complex components and composables.
- Journey (Vite Browser): Verify a full route/feature flow.
- E2E (Playwright): Smoke test the deployment and external integrations.

### 4. Testing philosophy

- Follow the philosphy of the test pyramid: more tests at lower levels to optimise for speed and completeness. Where possible move tests lower, using integration tests to give vertical confidence.
- Tests are a critical part of documentation and debugging. Design for readability and precision by following a BDD style, using builders, and render methods to simplify test setup.
- Parameterised tests should be used for simple permutations.
- Prefer single assertion tests, but in some cases this may not be practical, such as:
  - Mapping functions where certain fields mappings are simple and logically make sense to test together.
  - Higher levels of integration, where the performance cost of running through multiple steps is not worth the loss of precision
- Minimise test brittleness, by using builders and sociable testing. Avoid mocking, except when working with external APIs.
- Keep stable, repeatable tests, by avoiding shared state between tests

### 5. Verification

Before commiting you must verify your code changes. This includes

- Running the lint and build commands to quickly pick up any static and build time errors
- Running the full test suite to pick up any other issues
- Verifying test coverage and performance, and calling out any gaps

## Common Pitfalls

- Mocking Libraries Directly: Leads to brittle tests. Mock a wrapper or use the real library if possible.
- Heavy State Sharing: Never share mutable state between tests; it causes flabbiness and random failures.

References

- See [Testing Patterns](references/testing-patterns.md) for detailed patterns including the use of builders and page objects.
- See [Feature Module Architecture](references/feature-structure.md) for details on the structure and patterns of features

## References

- [General Workflow](../workflow-general/SKILL.md) — Required for verification and commit steps
- [Vue Components](../workflow-vue-components/SKILL.md) — Component-specific implementation patterns
