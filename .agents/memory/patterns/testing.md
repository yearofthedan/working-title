# Testing Patterns

Quick reference for established testing approaches.

For comprehensive testing rules, see [Testing Rules](../../rules-code/testing.md).

## At a Glance

- **Structure**: Nested `describe` blocks (file → method → logical group).
- **Builders**: Use factory functions from `__testHelpers__/builders.ts`.
- **Page Objects**: Centralize selectors for complex UI flows.
- **Browser Mode**: Use for integration tests requiring real DOM.

## Example

Refer to `src/features/story-canvas/StoryCanvas.spec.ts` for a comprehensive component test suite.
