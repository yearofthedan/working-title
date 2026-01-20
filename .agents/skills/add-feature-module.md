# Skill: Add Feature Module

How to create a new, isolated feature module following ADR-001.

## When to Use

- Implementing a new domain-specific set of functionality.
- Splitting a large existing feature into smaller parts.

## Prerequisites

- Clear understanding of the new feature's domain.

## Steps

1. **Directory**: Create `src/features/[feature-name]/`.
2. **Subdirectories**: Create standard subdirectories: `components/`, `composables/`, `__testHelpers__/`.
3. **Implementation**: Build components and composables within the feature directory.
4. **Isolation**: Ensure no imports from other features (except `common/`).

## Validation Checklist

- [ ] No cross-feature imports.
- [ ] Feature contains its own tests.
- [ ] Any shared logic moved to `utils/` or `features/common/`.

## Common Pitfalls

- Tightly coupling the new feature to an existing one.
- Forgetting to update `tsconfig.app.json` if new aliases are needed.

## References

- Decisions: [Feature Isolation](../memory/decisions/active/adr-001-feature-isolation.md)
- Rules: [Architecture](../../.roo/rules/architecture.md)
