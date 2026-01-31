import { createRouter, createWebHistory } from 'vue-router'
import { RouteNames } from '@/router/routes'
import { defineComponent, type Component, type ComponentOptions } from 'vue'
import { render as vueRender } from 'vitest-browser-vue'
import { createTestI18n } from '@/i18n/__testHelpers__/i18n-utils'
import { buildProviders } from './builders'

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
