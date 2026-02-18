import { computed } from 'vue'
import {
  useProjectSteps,
  useProjectContent,
} from '@/features/writing-project/composables/useActiveProjectContext'
import { useDefinitionsContext } from '@/features/writing-project/composables/useDefinitionsContext'

export function useSidebarViewModel() {
  const { steps } = useProjectSteps()
  const { template, getStepDef } = useDefinitionsContext()
  const { getContent, updateContent } = useProjectContent()

  const sidebarSteps = computed(() => {
    const stepDefMap = new Map(template.value.stepDefinitions.map((d) => [d.id, d]))

    return steps.value
      .filter((s) => {
        const def = stepDefMap.get(s.stepId)
        return def?.ui?.visibility?.includes('sidebar')
      })
      .map((step) => {
        const def = getStepDef(step.stepId)
        return {
          id: step.id,
          stepId: step.stepId,
          content: getContent(step.id)?.content.text ?? '',
          labelKey: def?.labelText ?? '',
          placeholderKey: def?.editorConfig.placeholderText ?? '',
        }
      })
  })

  return {
    steps: sidebarSteps,
    updateContent,
  }
}
