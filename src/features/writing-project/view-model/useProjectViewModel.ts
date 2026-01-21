import { computed, type Ref } from 'vue'
import type { ProjectData } from '@/features/writing-project/domain/types'
import type { ProcessTemplate } from '@/features/process-templates/processTemplate'
import type { ViewModel } from './types'

export function useProjectViewModel(projectData: Ref<ProjectData>, template: Ref<ProcessTemplate>) {
  const viewModel = computed<ViewModel>(() => {
    const stepDefinitionMap = new Map(template.value.stepDefinitions.map((s) => [s.id, s]))
    const validSteps = projectData.value.steps.filter((s) => stepDefinitionMap.has(s.stepId))

    const canvasSteps = validSteps.filter((s) =>
      stepDefinitionMap.get(s.stepId)?.ui.visibility.includes('canvas')
    )

    const sidebarSteps = validSteps.filter((s) =>
      stepDefinitionMap.get(s.stepId)?.ui?.visibility?.includes('sidebar')
    )

    return {
      canvasSteps,
      sidebarSteps,
      connections: projectData.value.connections,
    }
  })

  return { viewModel }
}
