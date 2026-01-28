import { ref } from 'vue'
import type { ProjectData } from '../storage/types'
import { projectStorage, ProjectStorage } from '../storage/ProjectStorage'
import { FileSystemProvider } from '@/utils/storage/FileSystemProvider'
import { useAutoSave } from './useAutoSave'

export const useProjectData = (
  initialProject: ProjectData,
  storage: ProjectStorage = projectStorage
) => {
  const projectData = ref<ProjectData>(initialProject)
  const fileSystemProvider = new FileSystemProvider()

  const { saveStatus, lastSaved, errorMessage } = useAutoSave({
    projectData,
    storage,
    fileSystemProvider,
  })

  return {
    project: projectData,
    saveStatus,
    lastSaved,
    errorMessage,
  }
}
