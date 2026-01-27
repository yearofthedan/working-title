import { ref, watch, type Ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { ProjectData } from '../storage/types'
import { projectStorage } from '../storage/ProjectStorage'

export const useProjectData = (initialProject: ProjectData) => {
  const projectData = ref<ProjectData>(initialProject)

  const save = async () => {
    if (projectData.value) {
      await projectStorage.save(projectData.value)
    }
  }

  const debouncedSave = useDebounceFn(save, 300, { maxWait: 2000 })

  watch(
    projectData,
    () => {
      debouncedSave()
    },
    { deep: true }
  )

  return {
    project: projectData as Ref<ProjectData>,
  }
}
