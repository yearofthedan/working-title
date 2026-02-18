import { type Ref } from 'vue'
import type { ProcessTemplate } from '@/features/process-templates/processTemplate'
import { useProjectMutations, useProjectSteps } from './useActiveProjectContext'

export interface ActionDefinition {
  id: string
  label: string
  trigger: 'append' | 'advance'
  targetType: string
  execute: () => string
}

const parseStepDefinitions = (template: ProcessTemplate) =>
  template.stepDefinitions.map(({ id, actions }) => ({
    id,
    actions,
  }))

export const useStepActions = (template: Ref<ProcessTemplate>) => {
  const { steps, connections } = useProjectSteps()
  const { addStep } = useProjectMutations()

  const getRootActions = (): ActionDefinition[] => {
    return template.value.rootActions.map(({ id, labelText, targetType, trigger }) => ({
      id,
      label: labelText,
      trigger: trigger as 'append' | 'advance',
      targetType,
      execute: () => addStep(targetType),
    }))
  }

  const getStepActions = (stepType: string, sourceId: string): ActionDefinition[] => {
    const defns = parseStepDefinitions(template.value)
    const stepDef = defns.find((d) => d.id === stepType)
    if (!stepDef) return []

    return stepDef.actions.map(({ id, labelText, targetType, trigger }) => ({
      id,
      label: labelText,
      trigger: trigger,
      targetType,
      execute: () => addStep(targetType, sourceId),
    }))
  }

  const getAvailableActions = (fromStepUid: string): ActionDefinition[] => {
    const step = steps.value.find((s) => s.id === fromStepUid)
    if (!step) return []

    const actions = getStepActions(step.stepId, fromStepUid)

    return actions.filter((action) => {
      if (action.trigger === 'advance') {
        const hasConnectionToTargetType = connections.value.some((c) => {
          if (c.source !== fromStepUid) return false
          const targetNode = steps.value.find((s) => s.id === c.target)
          return targetNode?.stepId === action.targetType
        })
        return !hasConnectionToTargetType
      }
      return true
    })
  }

  return {
    getRootActions,
    getStepActions,
    getAvailableActions,
  }
}
