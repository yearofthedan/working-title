# Test-Driven Development (TDD) Patterns

This guide explains the TDD approach used in this project, emphasizing the RED-GREEN-REFACTOR cycle.

## When to Use TDD

TDD is **mandatory** for:

- Features with user-visible behavior (notifications, confirmations, dialogs)
- User interactions (clicks, form submissions, navigation)
- Data mutations (create, update, delete operations)
- Data flow between composables and components
- Any feature with testable acceptance criteria

## The RED-GREEN-REFACTOR Cycle

### RED: Write a Failing Test

Before writing ANY implementation code, write a test that describes the expected behavior:

```typescript
// useProjectDelete.spec.ts
describe('useProjectDelete', () => {
  it('should trigger success notification when project deleted', async () => {
    // Arrange
    const { notifications } = createTestNotificationContext()
    const { deleteProject } = useProjectDelete()

    // Act
    await deleteProject('project-id')

    // Assert
    expect(notifications.value).toHaveLength(1)
    expect(notifications.value[0].type).toBe('success')
    expect(notifications.value[0].message).toContain('deleted')
  })
})
```

**Run the test and confirm it FAILS** with a meaningful error message:

- ❌ Test passes immediately → You tested the wrong thing
- ❌ Cryptic failure → Test setup needs work
- ✅ "Expected 1 notification but got 0" → Perfect, now implement

### GREEN: Write Minimum Code

Write ONLY enough code to make the test pass:

```typescript
// useProjectDelete.ts
export function useProjectDelete() {
  const { success } = useNotifications()

  async function deleteProject(id: string) {
    await storage.delete(id)
    success('Project deleted') // Added to pass test
  }

  return { deleteProject }
}
```

Run the test again → Should pass.

### REFACTOR: Clean Up

Improve the code while keeping tests green:

```typescript
export function useProjectDelete() {
  const { success } = useNotifications()
  const { t } = useI18n()

  async function deleteProject(id: string) {
    await storage.delete(id)
    success(t('app.project.deleted')) // Extracted to i18n
  }

  return { deleteProject }
}
```

Run test after each change → Must stay green.

## Common Pitfalls

### 1. "I'll Write Tests After"

**Problem:** Implementation without tests leads to:

- Silent failures (feature doesn't work but you don't notice)
- Difficulty writing tests retroactively
- Missing edge cases

**Solution:** NO CODE without a failing test first. No exceptions.

### 2. Testing Implementation Details

❌ **Bad** - Testing that a function was called:

```typescript
expect(mockNotifications.success).toHaveBeenCalled()
```

✅ **Good** - Testing observable behavior:

```typescript
expect(notifications.value[0].type).toBe('success')
```

**Rule:** Test what the user experiences, not how you implemented it.

### 3. Skipping TDD for "Simple" Changes

Even simple changes can have bugs. TDD is ESPECIALLY important for:

- Features involving user feedback
- Data mutations
- Navigation and routing
- Form validation

### 4. Writing Multiple Tests at Once

❌ **Bad:** Write 5 failing tests, then implement all at once

✅ **Good:** Write 1 failing test → Implement → Write next failing test → Implement

**Reason:** Keeps feedback loop tight, easier to debug.

## Testing Trophy Philosophy

We follow the Testing Trophy approach (see [testing patterns](../decisions/active/adr-008-agent-workflow-enforcement.md) for details):

1. **Static** - TypeScript catches type errors
2. **Unit (Sociable)** - Bulk of our suite, tests with real collaborators
3. **Integration** - Multi-module flows
4. **E2E** - Full system from user perspective

### Sociable vs. Solitary Testing

**Prefer "sociable" tests** that use real collaborators over mocked dependencies:

✅ **Good** - Real dependencies:

```typescript
const store = useProjectStorage() // Real store
const { createProject } = useProjectCreate() // Uses real store
```

❌ **Avoid** - Excessive mocking:

```typescript
const mockStore = { save: vi.fn() }
// Tests mock interactions, not real behavior
```

**Only mock:**

- External APIs
- Heavy infrastructure (file system, network)
- Non-deterministic code (timestamps, random)

## Real-World Example

**From notification feature implementation:**

### ❌ Wrong Approach

1. Built `AppNotificationContainer.vue` ✅
2. Added Storybook story ✅
3. Mounted in `App.vue` ✅
4. Manually tested in browser ✅
5. **FORGOT**: Tests that composables call `success()` ❌

**Result:** UI works, but notifications never trigger in real usage.

### ✅ Right Approach (TDD Cycles)

**Cycle 1:** Test delete triggers notification

```typescript
// RED: Write failing test
it('should show notification when project deleted', ...)
// GREEN: Add success() call to useProjectDelete
// REFACTOR: Extract message to i18n
```

**Cycle 2:** Test create triggers notification

```typescript
// RED: Write failing test
it('should show notification when project created', ...)
// GREEN: Add success() call to useProjectCreate
// REFACTOR: Ensure consistent message format
```

**Cycle 3:** Test notification display

```typescript
// RED: Write failing test
it('should render notification with correct icon', ...)
// GREEN: Implement icon mapping in component
// REFACTOR: Extract icon logic to computed
```

Each cycle builds on the previous, all tests stay green.

## Validation Checklist

For EACH feature behavior:

- [ ] Failing test written and executed (confirmed RED)
- [ ] Minimum implementation added
- [ ] Test executed again (confirmed GREEN)
- [ ] Implementation refactored if needed (test stays GREEN)
- [ ] Test covers user-observable behavior, not implementation
- [ ] Test is maintainable (uses builders, clear arrange-act-assert)

## See Also

- [Vue Testing Guide](vue-testing.md) - Component and composable testing patterns
- [Slice Workflow](../../.claude/skills/slice/SKILL.md) - Vertical slicing approach
- [Architecture: Test Co-location](../architecture.md#4-test-co-location-pageobjects-next-to-components-shared-builders-in-__testhelpers__) - Where to put test files
