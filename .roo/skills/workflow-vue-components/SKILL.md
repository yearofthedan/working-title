---
name: workflow-vue-components
description: Technical lifecycle for Vue 3 components using Vertical Slices, Tailwind v4, and Storybook Smoke Testing.
---

# workflow-vue-components

## Procedure

### 1. Component Organisation

- **Feature Entrypoint**: `src/features/[feature-name]/[FeatureName]Page.vue`
- **Feature-specific UI**: `src/features/[feature-name]/components/[ComponentName].vue`
- **Shared UI (Primitives)**: `src/features/common/[ComponentName].vue`
- **Component Groups**: `src/features/[feature-name]/[component-group]/[MainComponent].vue`

### 2. Implementation (Vertical Slice)

- Build narrow functional slivers before expanding the API.
- **Contract**: Define minimum `Props`, `Emits`, and `Models` for the current sliver only.
- **Structure**: Template → Script → Style.
- **Target**: < 60 lines.

### 3: State Management

Choose the state pattern based on the component's role:

- **Leaf/Simple Components**: Prefer Props and Events/Models. Keep them "dumb" and reusable.
- **Feature Slices**: Use Feature Context when state or mutations need to be shared across 3+ components or deep nesting levels. More detailed guidance at [Feature context](references/feature-context.md)

As trees become more complex, refactor the state implementation to avoid prop-drilling.

### 4. Refactoring (Extraction)

**Trigger**: If a component exceeds 100 lines or breaks single responsibility principle.

- **Identify**: Find a cohesive template block (e.g., a form section or complex list item).
- **Move**: Extract to an appropriate place according to organisation principles.
- **Alternatives**: Consider other approaches in addition or alternative to, such as extracting a **Composable** (Refer to [Composables](references/composables.md) for best practice).

### 5. Styling (Hybrid Approach)

More details under [Styling](references/styling.md)

- **Hierarchy**: Semantic Class > Theme Variable > Tailwind v4 Utility.
- **Layout**: Use custom flex utilities (`flex-h`, `flex-y`).

### 6. Verification & Testing

#### Storybook

More details under [Storybook templates](references/storybook-template.md)

- Every component must have exactly one Storybook file.
- Smoke Test: Include a test to verify the component renders in Storybook.

#### Component testing

- Create `[ComponentName].spec.ts` for components with user actions.
- **Focus**: Test that user inputs (clicks, typing) result in the correct output (emits, UI updates).
- **Process**: For behavior changes, update the `.spec.ts` before the `.vue` file.

### 7. Performance (Optional)

More details under [Performance](references/performance.md)

- **Check**: Is the component using heavy dependencies (>1MB) like Vue Flow or Tiptap, and is it impacting web load time?
- **Action**: Apply **Async Loading**, **Dormant Pattern**, or **Singleton Adapters** as defined in the Ref.

## Validation Checklist

- [ ] Correct folder used
- [ ] Minimal contract defined for current sliver?
- [ ] Appropriate state pattern implemented (Props vs Context)?
- [ ] SFC < 60 lines?
- [ ] Storybook story implemented to spec?
- [ ] Vitest tests verify user interactions?
- [ ] Styling correctly applied
- [ ] Component has single responsibility?
