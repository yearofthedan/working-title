# Testing Patterns

## Structure

Tests should follow the nested `describe` structure for clarity.

```typescript
describe('MyComponent', () => {
  describe('initialization', () => {
    it('sets default values', () => {
      // ...
    })
  })
})
```

## Conventions

- **Builders**: Use factory functions (`builders.ts`) for test data.
- **Page Objects**: Use Page Objects for complex UI interactions in integration tests.
- **Async**: Use `vi.waitUntil` or `expect.poll` for timing-sensitive assertions.
- **Browser Mode**: Use Vitest Browser Mode for tests requiring real DOM/browser behavior.

## Example

Refer to `src/features/story-canvas/StoryCanvas.spec.ts` for a comprehensive component test suite.
