import { provide, inject, type InjectionKey } from 'vue'
import { createProjectStore, type ProjectStore } from './store'

export const PROJECT_STORE_KEY: InjectionKey<ProjectStore> = Symbol('ProjectStore')

export function provideProjectStore(): ProjectStore {
  const store = createProjectStore()
  provide(PROJECT_STORE_KEY, store)
  return store
}

export function useProjectStore(): ProjectStore {
  const store = inject(PROJECT_STORE_KEY)
  if (!store) {
    throw new Error(
      'useProjectStore() must be called inside a component provided with provideProjectStore()'
    )
  }
  return store
}
