import { buildProcessTemplate } from '@/features/process-templates/__testHelpers__/builders'
import { buildProjectData } from '@/features/writing-project/storage/__testHelpers__/builders'
import {
  PROJECT_CONTEXT_KEY,
  projectContext,
  type ProjectContext,
} from '@/features/writing-project/domain/useProjectContext'
import {
  DEFINITIONS_CONTEXT_KEY,
  definitionsContext,
  type DefinitionsContext,
} from '@/features/writing-project/domain/useDefinitionsContext'
import { ref, defineComponent, h, type Component, type ComponentOptions } from 'vue'
import { render as vueRender } from 'vitest-browser-vue'
import { createI18n } from 'vue-i18n'

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
 * Creates a configured i18n instance for testing.
 * Silent by default to avoid polluting test output.
 */
export function createTestI18n(messages?: Record<string, unknown>) {
  return createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    missingWarn: false,
    fallbackWarn: false,
    messages: (messages as Record<string, never>) || { en: {} },
  })
}

/**
 * Custom render method that automatically provides i18n context
 * and supports custom providers.
 */
export function render(
  component: Component | ComponentOptions,
  options: Parameters<typeof vueRender>[1] = {}
) {
  const i18n = createTestI18n()

  const mergedOptions = {
    global: {
      plugins: [i18n],
      provide: buildProviders()
    },
    ...options,
  }

  return vueRender(component, mergedOptions)
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
      provide: providers,
    },
  })
}
