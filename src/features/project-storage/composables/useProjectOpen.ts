import { useAsyncState } from '@/features/common/composables/useAsyncState'
import type { ProjectData } from '@/features/project-storage/types'
import type { FileSystemStorageProvider } from '@/infra/files/FileSystemStorageProvider'
import type { ProjectStorage } from '@/features/project-storage/ProjectStorage'

export function useProjectOpen(storage: ProjectStorage, fileSystem: FileSystemStorageProvider) {
  const {
    state,
    execute: openProject,
    lastSuccess,
    onSuccess,
    onError,
  } = useAsyncState(async (mode: 'file' | 'directory' = 'file') => {
    if (mode === 'directory') {
      const dirHandle = await fileSystem.requestDirectoryHandle()

      if (!dirHandle.name.endsWith('.narrative')) {
        throw new Error('INVALID_FOLDER')
      }

      let projectData: ProjectData
      try {
        projectData = await fileSystem.readJsonFromDirectory<ProjectData>(dirHandle, 'project.wt')
      } catch (err) {
        if (err instanceof Error && err.name === 'NotFoundError') {
          throw new Error('MISSING_PROJECT_FILE')
        }
        if (err instanceof Error && err.name === 'NotAllowedError') {
          throw new Error('PERMISSION_DENIED')
        }
        if (err instanceof SyntaxError) {
          throw new Error('CORRUPTED_FILE')
        }
        throw err
      }

      if (!projectData.projectId || !projectData.steps) {
        throw new Error('CORRUPTED_FILE')
      }

      return await storage.save(projectData, undefined, dirHandle)
    }

    const handle = await fileSystem.requestOpenFileHandle()

    const projectData = await fileSystem.readAsJson<ProjectData>(handle)
    if (!projectData.projectId || !projectData.steps) {
      throw new Error('INVALID_PROJECT_FILE')
    }

    return await storage.save(projectData, handle)
  })

  return {
    openProject,
    state,
    lastSuccess,
    onSuccess,
    onError,
  }
}
