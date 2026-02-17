---
name: tdd-enforcement
description: Strict Test-Driven Development (TDD) enforcement for features with user-visible behavior. Ensures RED-GREEN-REFACTOR cycle prevents silent implementation failures.
---

# TDD Enforcement

## When to Use

- Implementing features that trigger user feedback (notifications, confirmations, errors)
- Adding new user interactions (clicks, form submissions, navigation)
- Modifying data flow between composables and components
- Any feature with acceptance criteria that can be tested

## Prerequisites

- Understanding of the feature requirements or spec
- Test framework setup (Vitest already configured in project)
- Familiarity with [`workflow-functional-changes`](../workflow-functional-changes/SKILL.md)

## Procedure

### 1. Identify Testable Behavior

From the spec or feature requirements, extract specific behaviors:

**Example from notification spec**:
- "When project is deleted, success notification appears"
- "Notification auto-dismisses after 4 seconds"
- "Clicking X button removes notification immediately"

### 2. Write Failing Test FIRST

Before ANY implementation code:

```typescript
// Example: useProjectDelete.spec.ts
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

**CRITICAL**: Run this test and **confirm it FAILS** with a meaningful error message.

❌ If test passes immediately → You tested the wrong thing
❌ If test has cryptic failure → Test setup needs work
✅ If test fails with "Expected 1 notification but got 0" → Perfect, now implement

### 3. Implement Minimum Code to Pass

Write ONLY enough code to make the test green:

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

Run test again → Should pass.

### 4. Refactor (While Keeping Test Green)

Clean up implementation:
- Extract magic strings to i18n
- Improve variable names
- Add error handling

Run test after each change → Must stay green.

### 5. Repeat for Each Behavior

Each acceptance criterion gets its own RED-GREEN-REFACTOR cycle.

## Common Pitfalls

### Pitfall 1: "I'll Write Tests After"

**Problem**: Implementation without tests leads to:
- Silent failures (feature doesn't actually work but you don't notice)
- Difficulty writing tests retroactively
- Missing edge cases

**Solution**: NO CODE without failing test. No exceptions.

### Pitfall 2: Testing Implementation Details

❌ **Bad**: Testing that a function was called
```typescript
expect(mockNotifications.success).toHaveBeenCalled()
```

✅ **Good**: Testing observable behavior
```typescript
expect(notifications.value[0].type).toBe('success')
```

**Rule**: Test what the user experiences, not how you implemented it.

### Pitfall 3: Skipping TDD for "Simple" Changes

**Problem**: Even simple changes can have bugs. User said "talk to me" but agent guessed.

**Solution**: TDD is ESPECIALLY important for:
- Features involving user feedback (notifications, errors)
- Data mutations (create, update, delete)
- Navigation and routing
- Form validation

### Pitfall 4: Writing Multiple Tests Before Implementation

❌ **Bad**: Write 5 failing tests, then implement all at once

✅ **Good**: Write 1 failing test → Implement → Write next failing test → Implement

**Reason**: Keeps feedback loop tight, easier to debug when something goes wrong.

## Validation Checklist

For EACH feature behavior:

- [ ] Failing test written and executed (confirmed RED)
- [ ] Minimum implementation added
- [ ] Test executed again (confirmed GREEN)
- [ ] Implementation refactored if needed (test stays GREEN)
- [ ] Test covers user-observable behavior, not implementation details
- [ ] Test is maintainable (uses builders, clear arrange-act-assert)

## Anti-Pattern Detection

**RED FLAGS** indicating TDD violation:

- Implementation code exists but no corresponding test
- Test file modified AFTER implementation file (should be BEFORE)
- Agent says "I've implemented X" without mentioning test results
- Feature works in Storybook but no test verifies the trigger logic
- Notification appears in UI but no test verifies composable calls `success()`

**If you catch ANY of these, STOP. Delete implementation and start with failing test.**

## References

**Detailed examples and patterns**: See [docs/guides/tdd-patterns.md](../../../docs/guides/tdd-patterns.md)



- [`plan-functional-slices`](../plan-functional-slices/SKILL.md) - Vertical slicing mindset
- [docs/guides/vue-testing.md](../../../docs/guides/vue-testing.md) - Vue component testing patterns
- [docs/guides/tdd-patterns.md](../../../docs/guides/tdd-patterns.md) - Real examples and Testing Trophy strategy
