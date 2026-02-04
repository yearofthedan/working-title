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
  const {
    state: listState,
    refreshList,
    onSuccess: onListSuccess,
    onError: onListError,
  } = useProjectList(storage)

  const {
    createProject,
    state: creationState,
    lastSuccess: createdSignal,
    onSuccess: onCreateSuccess,
    onError: onCreateError,
  } = useProjectCreate(storage, fs)
  const {
    updateProject,
    state: updateState,
    lastSuccess: updatedSignal,
    onSuccess: onUpdateSuccess,
    onError: onUpdateError,
  } = useProjectUpdate(storage, fs)
  const {
    deleteProject,
    state: deleteState,
    lastSuccess: deletedSignal,
    onSuccess: onDeleteSuccess,
    onError: onDeleteError,
  } = useProjectDelete(storage)
  const {
    openProject,
    state: openState,
    lastSuccess: openedSignal,
    onSuccess: onOpenSuccess,
    onError: onOpenError,
  } = useProjectOpen(storage, fs)

  watch(
    [createdSignal, deletedSignal, openedSignal, updatedSignal],
    () => {
      refreshList()
    },
    {
      immediate: true,
    }
  )

  const sortedProjects = computed(() => {
    const data = listState.value.data || []
    return [...data].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime()
      const dateB = new Date(b.updatedAt || b.createdAt).getTime()
      return dateB - dateA
    })
  })

  return {
    list: {
      projects: sortedProjects,
      status: computed(() => listState.value.status),
      state: listState,
      refresh: refreshList,
      onSuccess: onListSuccess,
      onError: onListError,
    },

    create: {
      execute: createProject,
      state: creationState,
      onSuccess: onCreateSuccess,
      onError: onCreateError,
    },

    update: {
      execute: updateProject,
      state: updateState,
      lastSaved: updatedSignal,
      onSuccess: onUpdateSuccess,
      onError: onUpdateError,
    },

    delete: {
      execute: deleteProject,
      state: deleteState,
      onSuccess: onDeleteSuccess,
      onError: onDeleteError,
    },

    open: {
      execute: openProject,
      state: openState,
      onSuccess: onOpenSuccess,
      onError: onOpenError,
    },
  }
}

export type ProjectStore = ReturnType<typeof createProjectStore>
