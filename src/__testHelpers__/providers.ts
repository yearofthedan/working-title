import { buildProcessTemplate } from '@/features/process-templates/__testHelpers__/builders'
import { buildProjectData } from '../features/writing-project/domain/__testHelpers__/builders'
import {
  PROJECT_CONTEXT_KEY,
  projectContext,
  type ProjectContext,
} from '../features/writing-project/view-model/useProjectContext'
import {
  DEFINITIONS_CONTEXT_KEY,
  definitionsContext,
  type DefinitionsContext,
} from '../features/writing-project/view-model/useDefinitionsContext'
import { ref, defineComponent, h } from 'vue'
import { render } from 'vitest-browser-vue'

export interface Providers {
  [PROJECT_CONTEXT_KEY]: ProjectContext
  [DEFINITIONS_CONTEXT_KEY]: DefinitionsContext
}

export const buildProviders = (overrides: Partial<Providers> = {}): Providers => {
  const providers: Providers = {
    [PROJECT_CONTEXT_KEY]: projectContext(ref(buildProjectData())),
    [DEFINITIONS_CONTEXT_KEY]: definitionsContext(ref(buildProcessTemplate()), ref({})),
  }

  if (overrides[PROJECT_CONTEXT_KEY]) {
    providers[PROJECT_CONTEXT_KEY] = overrides[PROJECT_CONTEXT_KEY]!
  }
  if (overrides[DEFINITIONS_CONTEXT_KEY]) {
    providers[DEFINITIONS_CONTEXT_KEY] = overrides[DEFINITIONS_CONTEXT_KEY]!
  }

  return providers
}

/**
 * Helper to run a callback (typically containing a composable call) within a component context
 * with the necessary providers for writing project features.
 */
export function runWithContext(callback: () => void, providers: Partial<Providers> = {}) {
  const TestComponent = defineComponent({
    setup() {
      callback()
      return () => h('div')
    },
  })

  return render(TestComponent, {
    global: {
      provide: buildProviders(providers),
    },
  })
}
