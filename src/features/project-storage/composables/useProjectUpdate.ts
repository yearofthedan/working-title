import { useAsyncState } from '@/features/common/composables/useAsyncState'
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

    const fileHandle = await storage.getFileHandle(projectData.projectId)
    if (fileHandle) {
      await fileSystem.writePermittedAsJson(fileHandle, projectData)
    }

    const directoryHandle = await storage.getDirectoryHandle(projectData.projectId)
    if (directoryHandle) {
      await fileSystem.writeJsonToDirectory(directoryHandle, 'project.wt', projectData)
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
