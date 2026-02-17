# Vue Composables Guide

Patterns and conventions for creating composables in this Vue 3 project.

## When to Create a Composable

Extract logic into a composable when:

1. **Component exceeds 100 lines** - Component is doing too much
2. **Logic is shared across 2+ components** - DRY principle applies
3. **Complex state management** - Multiple reactive values with interdependencies
4. **Side effects need coordination** - Watchers, lifecycle hooks, async operations

## Location Rules

**Critical:** Composables are a technique, not a category. They live with the concern they serve.

### ✅ Correct

```
src/features/writing-project/
├── composables/
│   ├── useProjectLoader.ts
│   └── useStepActions.ts
```

Feature-specific composables stay in `src/features/[feature]/composables/`.

### ❌ Incorrect

```
src/composables/
├── project/
│   ├── useProjectLoader.ts
│   └── useStepActions.ts
```

Do not create a top-level `src/composables/` directory for feature logic.

### Global Composables

A few composables are truly global and live in `src/composables/`:

- [`useLogger`](../../src/composables/useLogger.ts) - Logging infrastructure
- [`useNotifications`](../../src/composables/useNotifications.ts) - App-wide notification system

**Test:** If the composable could be used in ANY feature, it might be global. Otherwise, it's feature-specific.

## Composable Structure

### Input Parameters

Use `MaybeRefOrGetter<T>` for flexibility:

```typescript
import { type MaybeRefOrGetter, toValue } from 'vue'

export function useProjectLoader(projectId: MaybeRefOrGetter<string>) {
  const loadProject = async () => {
    const id = toValue(projectId) // Works with refs, getters, or raw values
    // ...
  }

  return { loadProject }
}
```

**Why `MaybeRefOrGetter`?** Allows callers to pass:

- Raw values: `useProjectLoader('project-1')`
- Refs: `useProjectLoader(projectIdRef)`
- Getters: `useProjectLoader(() => props.projectId)`

**Always use `toValue()`** to access the parameter value.

### Return Values

Always return a plain object containing refs and methods:

✅ **Correct:**

```typescript
export function useCounter() {
  const count = ref(0)
  const increment = () => count.value++

  return {
    count, // Ref
    increment, // Method
  }
}
```

❌ **Incorrect:**

```typescript
export function useCounter() {
  const count = ref(0)
  return count // Single value, not an object
}
```

### Naming Convention

- **Composable file:** `useSomething.ts`
- **Exported function:** `export function useSomething()`
- **Test file:** `useSomething.spec.ts`

## Common Patterns

### Async State Management

```typescript
import { ref } from 'vue'

export function useAsyncOperation() {
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<Data | null>(null)

  const execute = async () => {
    isLoading.value = true
    error.value = null

    try {
      data.value = await fetchData()
    } catch (e) {
      error.value = e as Error
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    data,
    execute,
  }
}
```

### Composable Composition

Composables can use other composables:

```typescript
export function useProjectDelete() {
  const { success, error } = useNotifications() // Global composable
  const logger = useLogger() // Global composable
  const storage = useProjectStorage() // Feature composable

  const deleteProject = async (id: string) => {
    try {
      await storage.delete(id)
      success('Project deleted')
      logger.info('Project deleted', { id })
    } catch (e) {
      error('Failed to delete project')
      logger.error('Delete failed', { id, error: e })
    }
  }

  return { deleteProject }
}
```

### Reactive Dependencies

Use `watch` or `watchEffect` for reactive updates:

```typescript
import { watch, ref, type MaybeRefOrGetter, toValue } from 'vue'

export function useFilteredItems(
  items: MaybeRefOrGetter<Item[]>,
  filter: MaybeRefOrGetter<string>
) {
  const filtered = ref<Item[]>([])

  const updateFiltered = () => {
    const itemList = toValue(items)
    const filterText = toValue(filter)
    filtered.value = itemList.filter((item) => item.name.includes(filterText))
  }

  // Re-run when items or filter changes
  watch([() => toValue(items), () => toValue(filter)], updateFiltered, {
    immediate: true,
  })

  return { filtered }
}
```

## Testing Composables

See [Vue Testing Guide](vue-testing.md#1-composable-testing) for detailed patterns.

### Simple Test

```typescript
import { describe, it, expect } from 'vitest'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('should increment count', () => {
    const { count, increment } = useCounter()

    expect(count.value).toBe(0)
    increment()
    expect(count.value).toBe(1)
  })
})
```

### Complex Test (with Component Context)

```typescript
import { it } from '@/__testHelpers__/fixtures'
import { runWithComponent } from '@/__testHelpers__/renderer'
import { useProjectLoader } from './useProjectLoader'

describe('useProjectLoader', () => {
  it('should load project data', async () => {
    const loader = runWithComponent(() => useProjectLoader('project-1'))

    await loader.load()

    expect(loader.data.value).toBeDefined()
  })
})
```

## Anti-Patterns

### ❌ Don't: Generic Composable Directories

```
src/composables/
├── useProjectLoader.ts  # Should be in features/
├── useCanvasLayout.ts   # Should be in features/
```

### ❌ Don't: Single Return Values

```typescript
export function useCount() {
  return ref(0) // Wrong: should return object
}
```

### ❌ Don't: Accessing Parameters Directly

```typescript
export function useFilter(items: MaybeRefOrGetter<Item[]>) {
  // Wrong: items might be a ref or getter
  const filtered = items.filter(...)

  // Correct: use toValue
  const filtered = toValue(items).filter(...)
}
```

### ❌ Don't: Stateful Singletons

```typescript
// Wrong: shared state across all instances
const globalCount = ref(0)

export function useCounter() {
  return { count: globalCount }
}
```

Each composable call should have independent state unless explicitly designed as a singleton (like `useNotifications`).

## Checklist

When creating a composable:

- [ ] Placed in correct directory (`features/[feature]/composables/` or `src/composables/` for global)
- [ ] Parameters use `MaybeRefOrGetter<T>` and accessed via `toValue()`
- [ ] Returns plain object with refs and methods
- [ ] Follows `useSomething` naming convention
- [ ] Has corresponding `.spec.ts` test file
- [ ] Documented with JSDoc if complex
- [ ] No accidental singleton state

## See Also

- [Architecture: Composables are a technique](../architecture.md#1-composables-are-a-technique-not-a-category) - Location philosophy
- [Vue Testing Guide](vue-testing.md) - Testing patterns
- [Domain Implementation](../domain-implementation.md) - View model transformation examples
