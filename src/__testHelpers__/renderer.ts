import { createRouter, createWebHistory } from 'vue-router'
import { RouteNames } from '@/router/routes'
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
import { ref, defineComponent, type Component, type ComponentOptions } from 'vue'
import { render as vueRender } from 'vitest-browser-vue'
import { createTestI18n } from '@/i18n/__testHelpers__/i18n-utils'

export type Providers = {
  [PROJECT_CONTEXT_KEY]: ProjectContext
  [DEFINITIONS_CONTEXT_KEY]: DefinitionsContext
}

export const buildProviders = (overrides: Partial<Providers> = {}): Providers => {
  return {
    [PROJECT_CONTEXT_KEY]: projectContext(ref(buildProjectData())),
    [DEFINITIONS_CONTEXT_KEY]: definitionsContext(ref(buildProcessTemplate())),
    ...overrides,
  } as Providers
}

type VueRenderOptions = Parameters<typeof vueRender>[1]
type Globals = NonNullable<VueRenderOptions>['global']

export const buildGlobals = (overrides: Partial<Globals> = {}): Globals => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: RouteNames.Home, component: { render: () => null } },
      { path: '/demo', name: RouteNames.Demo, component: { render: () => null } },
      { path: '/project/:id?', name: RouteNames.Project, component: { render: () => null } },
    ],
  })

  return {
    provide: buildProviders(),
    plugins: [createTestI18n(), router],
    ...overrides,
  }
}

/**
 * Custom render method that automatically provides globals
 */
export function render(component: Component | ComponentOptions, options: VueRenderOptions = {}) {
  return vueRender(component, {
    global: buildGlobals(),
    ...options,
  })
}

/**
 * Helper to run a callback (typically containing a composable call) within a component context
 * with the necessary providers for writing project features.
 */
export function runWithContext(callback: () => void, options: VueRenderOptions = {}) {
  const TestComponent = defineComponent({
    setup() {
      callback()
    },
    template: '<div></div>',
  })

  return render(TestComponent, options)
}

export const runWithComponent = <T>(fn: () => T, options: VueRenderOptions = {}) => {
  let result: T
  runWithContext(() => (result = fn()), {
    global: buildGlobals(),
    ...options,
  })

  return result!
}
