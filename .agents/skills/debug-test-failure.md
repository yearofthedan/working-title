# Skill: Debug Test Failure

Systematic approach to troubleshooting failing tests in Vitest.

## When to Use

- A test fails in CI or locally.
- Unclear why a specific assertion is failing.

## Prerequisites

- Test runner available (`./do test`).

## Steps

1. **Isolate**: Run only the failing test using `.only` or the `-t` flag in Vitest.
2. **Review Output**: Carefully read the error message and diff. Note which assertion failed and why.
3. **Trace**: Add `console.log` or use a debugger to inspect variables at the time of failure.
4. **Environment**: Check if the test relies on specific environment variables or global state.
5. **Reactivity**: If testing Vue components, ensure you've awaited necessary updates (`nextTick`, `vi.waitUntil`).
6. **Data**: Verify the test data being used (check builders).
7. **Fix**: Apply the fix and run all tests in the suite to ensure no regressions.

## Validation Checklist

- [ ] Failing test now passes.
- [ ] All other tests in the file pass.
- [ ] No temporary `console.log` or `.only` left in code.

## Common Pitfalls

- Assuming the error is in the test when it might be in the implementation (or vice versa).
- Forgetting that tests run in parallel (isolation issues).

## References

- Gotchas: [Testing](../memory/gotchas.md#testing)
- Rules: [Testing](../../.roo/rules-code/testing.md)
