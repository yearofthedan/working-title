import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { ProjectData, Step } from '@/features/writing-project/domain/types'
import { now } from '@/utils/dates'
import { strings } from '@/features/process-templates/snowflake/strings'
import { template } from '@/features/process-templates/snowflake/template'
import { generateId } from '@/utils/ids'
import { projectStorage } from './ProjectStorage'

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

  const savedData = projectStorage.loadCurrent()
  if (savedData) {
    projectData.value = savedData
  }

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

  return {
    project: projectData,
    template: template,
    strings: strings,
  }
}
