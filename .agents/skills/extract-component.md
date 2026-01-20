# Skill: Extract Component

Procedure for refactoring large components into smaller, more manageable ones.

## When to Use

- Component exceeds 100 lines of code.
- A part of a component is reused or could be reused.
- Component has too many responsibilities.

## Prerequisites

- Original component is covered by tests.

## Steps

1. **Identify**: Find a cohesive block of template and logic that can be extracted.
2. **Draft**: Create the new component file and move the identified code into it.
3. **Props/Emits**: Define the necessary props and emits for the new component to communicate with its parent.
4. **Test**: Create a basic test for the new component and ensure parent component tests still pass.
5. **Story**: Add a Storybook story for the new component to document its states.
6. **Integrate**: Replace the extracted code in the parent component with the new sub-component.

## Validation Checklist

- [ ] Parent component tests pass.
- [ ] New component has its own tests and stories.
- [ ] Code is more readable and easier to maintain.

## Common Pitfalls

- Passing too many props (consider a shared composable or store).
- Deeply nesting components (keep it shallow).

## References

- Patterns: [Vue Components](../memory/patterns/vue-components.md)
- Rules: [Code Style](../../.roo/rules-code/code-style.md)
