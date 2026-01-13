import { type Ref } from 'vue'
import type { ProcessTemplate } from '@/features/process-templates/processTemplate'
import type { ProjectMutations } from '@/features/story/composables/useProjectMutations'
import { parseRootActions, parseStepDefinitions } from '@/features/process-templates/actions'

export interface ActionHandler {
  id: string
  label: string
  execute: () => void
}

export const useStepActions = (
  template: Ref<ProcessTemplate>,
  strings: Ref<Record<string, unknown>>,
  mutations: ProjectMutations
) => {
  const defns = parseStepDefinitions(template.value, strings.value)

  const getRootActions = (): ActionHandler[] => {
    return parseRootActions(template.value, strings.value).map(({ id, label, targetType }) => ({
      id,
      label,
      execute: () => {
        mutations.addStep(targetType)
      },
    }))
  }

  const getStepActions = (stepType: string, sourceId: string): ActionHandler[] => {
    const stepDef = defns.find((d) => d.id === stepType)
    if (!stepDef) return []

    return stepDef.actions.map(({ id, label, targetType }) => ({
      id,
      label,
      execute: () => {
        mutations.addStep(targetType, sourceId)
      },
    }))
  }

  return {
    getRootActions,
    getStepActions,
  }
}
