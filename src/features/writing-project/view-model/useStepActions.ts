import { type Ref } from 'vue'
import type { ProcessTemplate } from '@/features/process-templates/processTemplate'
import type { ProjectData } from '@/features/writing-project/domain/types'
import { parseRootActions, parseStepDefinitions } from '@/features/process-templates/actions'
import type { ProjectMutations } from '../domain/useProjectMutations'

export interface ActionDefinition {
  id: string
  label: string
  trigger: 'append' | 'advance'
  targetType: string
  execute: () => string
}

export const useStepActions = (
  project: Ref<ProjectData>,
  template: Ref<ProcessTemplate>,
  strings: Ref<Record<string, unknown>>,
  mutations: ProjectMutations
) => {
  const defns = parseStepDefinitions(template.value, strings.value)

  const getRootActions = (): ActionDefinition[] => {
    return parseRootActions(template.value, strings.value).map(
      ({ id, label, targetType, trigger }) => ({
        id,
        label,
        trigger: trigger as 'append' | 'advance',
        targetType,
        execute: () => mutations.addStep(targetType),
      })
    )
  }

  const getStepActions = (stepType: string, sourceId: string): ActionDefinition[] => {
    const stepDef = defns.find((d) => d.id === stepType)
    if (!stepDef) return []

    return stepDef.actions.map(({ id, label, targetType, trigger }) => ({
      id,
      label,
      trigger: trigger as 'append' | 'advance',
      targetType,
      execute: () => mutations.addStep(targetType, sourceId),
    }))
  }

  const getAvailableActions = (fromStepUid: string): ActionDefinition[] => {
    const step = project.value.steps.find((s) => s.id === fromStepUid)
    if (!step) return []

    const actions = getStepActions(step.stepId, fromStepUid)

    return actions.filter((action) => {
      if (action.trigger === 'advance') {
        const hasConnectionToTargetType = project.value.connections.some((c) => {
          if (c.source !== fromStepUid) return false
          const targetNode = project.value.steps.find((s) => s.id === c.target)
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
