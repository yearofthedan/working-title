import { computed } from 'vue'
import {
  useProjectSteps,
  useProjectContent,
} from '@/features/writing-project/domain/useProjectContext'
import { useDefinitionsContext } from '@/features/writing-project/domain/useDefinitionsContext'

export function useSidebarViewModel() {
  const { steps } = useProjectSteps()
  const { template, getStepDef } = useDefinitionsContext()
  const { contentMap, getContent, updateContent } = useProjectContent()

  const sidebarSteps = computed(() => {
    const stepDefMap = new Map(template.value.stepDefinitions.map((d) => [d.id, d]))

    return steps.value.filter((s) => {
      const def = stepDefMap.get(s.stepId)
      return def?.ui?.visibility?.includes('sidebar')
    })
  })

  const getStepIdByUid = (id: string) => {
    return contentMap.value.get(id)?.stepId ?? ''
  }

  const getStepContent = (id: string) => {
    return getContent(id)?.content.text ?? ''
  }

  const getStepLabel = (stepId: string) => {
    return getStepDef(stepId)?.label ?? 'Unknown'
  }

  const getStepPlaceholder = (stepId: string) => {
    return getStepDef(stepId)?.placeholder ?? ''
  }

  return {
    steps: sidebarSteps,
    getStepIdByUid,
    getStepContent,
    getStepLabel,
    getStepPlaceholder,
    updateContent,
  }
}
