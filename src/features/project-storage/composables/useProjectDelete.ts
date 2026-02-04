import { useAsyncState } from '@/composables/useAsyncState'
import type { ProjectStorage } from '../ProjectStorage'

export function useProjectDelete(storage: ProjectStorage) {
  const {
    state,
    execute: deleteProject,
    lastSuccess,
    onSuccess,
    onError,
  } = useAsyncState(
    async (id: string) => {
      await storage.delete(id)
    }
  )

  return { deleteProject, state, lastSuccess, onSuccess, onError }
}
