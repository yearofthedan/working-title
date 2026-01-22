# Performance Patterns (Heavy Components)

Guidelines for managing components with heavy dependencies (>1MB) like Vue Flow, Tiptap, or specialized layout engines.

## 1. Async Component Loading

### When to Use

The component is heavy but isn't required for the initial "above the fold" page load (e.g., a modal, a secondary tab, or a canvas at the bottom of a page).

### Implementation

Use defineAsyncComponent to split the code into a separate chunk. Use <Suspense> to handle the loading state.

```
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

// This creates a separate JS chunk
const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)
</script>

<template>
  <Suspense>
    <HeavyComponent />
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>
```

## 2. Dormant Pattern

### When to Use

The user needs to see the content immediately, but the "expensive" editing tools are only needed if they decide to interact (e.g., Click-to-edit).

### Implementation

Swap a lightweight read-only "shell" for the full component on user interaction.

```
<script setup lang="ts">
const isActive = ref(false)
const activate = () => { isActive.value = true }
</script>

<template>
  <div v-if="!isActive" class="preview-mode" @click="activate">
    <div v-html="sanitizedPreview" />
    <span class="edit-hint">Click to edit</span>
  </div>

  <div v-else class="editor-mode">
    <HeavyEditor v-model="content" />
  </div>
</template>
```

## 3. Singleton Adapters

### When to Use

Multiple components on the same page need the same heavy utility (e.g., three different canvases all using the same ELK layout engine).

### Implementation

Wrap the library in a helper that imports it once and caches the instance.

```
// utils/heavyLibraryAdapter.ts
let cachedInstance: any = null

export async function getLibrary() {
  if (!cachedInstance) {
    // Dynamic import happens exactly once
    const { DefaultExport } = await import('heavy-library')
    cachedInstance = new DefaultExport()
  }
  return cachedInstance
}
```

### ELK Layout Node Sizes

- **Problem**: ELK needs exact node dimensions to calculate a good layout, but Vue renders nodes with dynamic sizes.
- **Solution**: Use `ResizeObserver` (via `useNodeSizeObserver`) to measure nodes and feed dimensions back into the layout engine.

## Troubleshooting & Analysis

| Symptom           | Detection                                           | Fix                                         |
| ----------------- | --------------------------------------------------- | ------------------------------------------- |
| Slow Initial Load | Network tab: Main .js bundle > 500KB                | Identify heavy lib and apply Async Loading. |
| High Memory/Lag   | Memory tab: Multiple instances of same lib          | Implement Singleton Adapter.                |
| Layout Jitter     | "Visual: Content ""pops"" in and moves other items" | Use a sized Suspense fallback (skeleton).   |
