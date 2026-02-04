import { useAsyncState } from '@/composables/useAsyncState'
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
  } = useAsyncState(async () => {
    const handle = await fileSystem.requestOpenFileHandle()

    const projectData = await fileSystem.readAsJson<ProjectData>(handle)
    if (!projectData.projectId || !projectData.steps) {
      throw new Error('Invalid project file')
    }

    const metadata = await storage.save(projectData, handle)

    return metadata
  })

  return {
    openProject,
    state,
    lastSuccess,
    onSuccess,
    onError,
  }
}
