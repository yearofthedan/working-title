import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { ProjectData, Step } from '@/features/story/types'
import { now } from '@/utils/dates'
import { strings } from '@/features/process-templates/snowflake/strings'
import { template } from '@/features/process-templates/snowflake/template'
import { generateId } from '@/utils/ids'
import { useProjectMutations } from './composables/useProjectMutations'
import { projectStorage } from './storage/ProjectStorage'

const createNewProject = (): ProjectData => {
  const created = now()

  const initialSteps: Step[] = template.stepDefinitions
    .filter((def) => def.isInitial)
    .map((def) => ({
      id: generateId(),
      stepId: def.id,
      content: {
        text: '',
      },
    }))

  return {
    schemaVersion: '1.0.0',
    projectId: generateId(),
    templateId: template.id,
    templateVersion: template.version,
    meta: {
      name: 'Untitled Story',
      created: created,
      lastModified: created,
    },
    steps: initialSteps,
    connections: [],
  }
}

export const useProjectData = () => {
  const projectData = ref<ProjectData>(createNewProject())

  // Try to load initial data from storage adapter
  const savedData = projectStorage.loadCurrent()
  if (savedData) {
    projectData.value = savedData
  }

  // Reactive auto-save logic
  const save = () => {
    projectStorage.save(projectData.value)
  }

  const debouncedSave = useDebounceFn(save, 300, { maxWait: 2000 })

  watch(
    projectData,
    () => {
      debouncedSave()
    },
    { deep: true }
  )

  const mutations = useProjectMutations(projectData)

  return {
    project: projectData,
    template: template,
    strings: strings,
    mutations,
  }
}
