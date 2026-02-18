import { useAsyncState } from '@/features/common/composables/useAsyncState'
import { type ProjectStorage } from '@/features/project-storage/ProjectStorage'

export function useProjectList(storage: ProjectStorage) {
  const {
    state,
    execute: refreshList,
    lastSuccess,
    onSuccess,
    onError,
  } = useAsyncState(() => storage.listProjects(), {
    initial: [],
  })

  return {
    state,
    refreshList,
    lastSuccess,
    onSuccess,
    onError,
  }
}
