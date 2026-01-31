import { useAsyncState } from '@/composables/useAsyncState'
import { type ProjectStorage } from '@/features/project-storage/ProjectStorage'

export function useProjectList(storage: ProjectStorage) {
  const {
    state,
    execute: refreshList,
    lastSuccess,
  } = useAsyncState(() => storage.listProjects(), {
    initial: [],
  })

  return {
    state,
    refreshList,
    lastSuccess,
  }
}
