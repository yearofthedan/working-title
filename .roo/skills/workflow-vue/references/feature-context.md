# Feature Context Pattern

Use this to share state and logic across a feature. It ensures everything is typed and easy to mock in tests.

## 1. The Context Contract

Define the interface and a unique `InjectionKey` using a `Symbol`.

```typescript
import { inject, provide, type Ref, type InjectionKey } from 'vue'

export interface ProjectContext {
  steps: Ref<Step[]>
  updateContent: (id: string, text: string) => void
}

export const PROJECT_CONTEXT_KEY: InjectionKey<ProjectContext> = Symbol('projectContext')
```

## 2. The Context Factory

The factory function holds the logic. Keep it separate from provide so it can be used in tests.

```typescript
export function projectContext(projectData: Ref<ProjectData>): ProjectContext {
  const steps = computed(() => projectData.value.steps)

  const updateContent = (id: string, text: string) => {
    const step = projectData.value.steps.find((s) => s.id === id)
    if (step) step.content.text = text
  }

  return { steps, updateContent }
}
```

## 3. Consumer Hooks (Slices)

Use specialized hooks to grant components access to only the data or mutations they need.

```typescript
export function useProjectContext(): ProjectContext {
  const context = inject(PROJECT_CONTEXT_KEY)
  if (!context) throw new Error('useProjectContext must be used within provideProjectContext')
  return context
}

// Example slice for UI components
export function useProjectContent() {
  const ctx = useProjectContext()
  return {
    contentMap: ctx.contentMap,
    updateContent: ctx.updateContent,
  }
}
```

## 4. Test Integration

### Provider builder to simplify tests

Add the context to the existing buildProviders helper to support browser-based testing via runWithComponent.

```typescript
// src/__testHelpers__/providers.ts
export const buildProviders = (overrides: Partial<Providers> = {}): Providers => {
  const providers: Providers = {
    [PROJECT_CONTEXT_KEY]: projectContext(ref(buildProjectData())),
    // Add other context keys here
  }
  return { ...providers, ...overrides }
}
```

### Test component wrappers

Composables that use inject must be executed within a component's setup function during testing. Use runWithComponent to wrap your test logic in a dummy component that has access to the feature providers.

```typescript
// src/__testHelpers__/providers.ts
export const runWithComponent = <T>(fn: () => T, options: VueRenderOptions = {}) => {
  let result: T
  runWithContext(() => (result = fn()), {
    global: buildGlobals(),
    ...options,
  })

  return result!
}
```

## Validation Checklist

[ ] Context uses a Symbol for the InjectionKey?
[ ] Hooks throw an error if used outside a provider?
[ ] Context key is registered in the central buildProviders helper?
