import { useAsyncState } from '@/composables/useAsyncState'
import type { ProjectData } from '../types'
import { now } from '@/utils/dates'
import type { FileSystemStorageProvider } from '@/infra/files/FileSystemStorageProvider'
import type { ProjectStorage } from '@/features/project-storage/ProjectStorage'

export function useProjectUpdate(storage: ProjectStorage, fileSystem: FileSystemStorageProvider) {
  const {
    state,
    execute: updateProject,
    lastSuccess,
    onSuccess,
    onError,
  } = useAsyncState(async (projectData: ProjectData) => {
    projectData.meta.lastModified = now()
    await storage.save(projectData)

    const handle = await storage.getFileHandle(projectData.projectId)
    if (handle) {
      await fileSystem.writePermittedAsJson(handle, projectData)
    }

    return projectData
  })

  return {
    updateProject,
    state,
    lastSuccess,
    onSuccess,
    onError,
  }
}
