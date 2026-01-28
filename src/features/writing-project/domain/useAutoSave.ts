import { ref, type Ref } from 'vue'
import { watchDebounced } from '@vueuse/core'
import type { ProjectData } from '../storage/types'
import type { ProjectStorage } from '../storage/ProjectStorage'
import type { FileSystemProvider } from '@/utils/storage/FileSystemProvider'
import { writeFileWithPermissionRetry } from '@/utils/storage/fileSystemUtils'

export type SaveStatus = 'saved' | 'saving' | 'error'

export interface UseAutoSaveOptions {
  projectData: Ref<ProjectData>
  storage: ProjectStorage
  fileSystemProvider: FileSystemProvider
  debounceMs?: number
}

export function useAutoSave({
  projectData,
  storage,
  fileSystemProvider,
  debounceMs = 2000,
}: UseAutoSaveOptions) {
  const saveStatus = ref<SaveStatus>('saved')
  const lastSaved = ref<Date | null>(null)
  const errorMessage = ref<string | null>(null)

  const save = async () => {
    if (!projectData.value) return

    saveStatus.value = 'saving'
    errorMessage.value = null

    try {
      await storage.save(projectData.value)

      const fileHandle = await storage.getFileHandle(projectData.value.projectId)
      if (fileHandle) {
        await writeFileWithPermissionRetry(fileSystemProvider, fileHandle, projectData.value)
      }

      saveStatus.value = 'saved'
      lastSaved.value = new Date()
    } catch (err) {
      console.error('Auto-save failed:', err)
      saveStatus.value = 'error'
      errorMessage.value = err instanceof Error ? err.message : 'Unknown save error'
    }
  }

  watchDebounced(
    projectData,
    () => {
      save()
    },
    {
      deep: true,
      debounce: debounceMs,
      maxWait: debounceMs * 5,
    }
  )

  return {
    saveStatus,
    lastSaved,
    errorMessage,
  }
}
