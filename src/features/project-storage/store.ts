import { watch, computed } from 'vue'
import { useProjectList } from './composables/useProjectList'
import { useProjectCreate } from './composables/useProjectCreate'
import { useProjectDelete } from './composables/useProjectDelete'
import { useProjectOpen } from './composables/useProjectOpen'
import { useProjectUpdate } from './composables/useProjectUpdate'
import { createFileSystemProvider } from '@/infra/files/factory'
import { projectStorage } from './ProjectStorage'
import type { FileSystemStorageProvider } from '@/infra/files/FileSystemStorageProvider'
import type { ProjectStorage } from '@/features/project-storage/ProjectStorage'

export function createProjectStore(
  storage: ProjectStorage = projectStorage,
  fs: FileSystemStorageProvider = createFileSystemProvider()
) {
  const { state: listState, refreshList } = useProjectList(storage)

  const {
    createProject,
    state: creationState,
    lastSuccess: createdSignal,
  } = useProjectCreate(storage, fs)
  const {
    updateProject,
    state: updateState,
    lastSuccess: updatedSignal,
  } = useProjectUpdate(storage, fs)
  const {
    deleteProject,
    state: deleteState,
    lastSuccess: deletedSignal,
  } = useProjectDelete(storage)
  const { openProject, state: openState, lastSuccess: openedSignal } = useProjectOpen(storage, fs)

  watch([createdSignal, deletedSignal, openedSignal, updatedSignal], () => refreshList(), {
    immediate: true,
  })

  const sortedProjects = computed(() => {
    const data = listState.value.data || []
    return [...data].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime()
      const dateB = new Date(b.updatedAt || b.createdAt).getTime()
      return dateB - dateA
    })
  })

  return {
    projects: sortedProjects,
    listStatus: computed(() => listState.value.status),
    listAsyncState: listState,

    createProject,
    creationState,

    updateProject,
    updateState,

    deleteProject,
    deleteState,

    openProject,
    openState,
  }
}

export type ProjectStore = ReturnType<typeof createProjectStore>
