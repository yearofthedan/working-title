# Composable Patterns

## Structure

Composables should focus on a single responsibility and return reactive state or methods.

```typescript
import { ref, onMounted } from 'vue'

export function useFeature(id: string) {
  const data = ref(null)
  const isLoading = ref(false)

  async function fetchData() {
    isLoading.value = true
    // ... logic
    isLoading.value = false
  }

  onMounted(fetchData)

  return {
    data,
    isLoading,
    fetchData,
  }
}
```

## Conventions

- **Naming**: Always prefix with `use` (e.g., `useProject`).
- **Input**: Accept `Ref` or values; use `toValue()` for flexible access.
- **Output**: Return an object of refs and functions.
- **Side Effects**: Keep side effects (like API calls) inside composables to make components easier to test.

## Example

Refer to `src/features/story/useProjectData.ts` for a robust data-fetching composable.
