import { getValueAtPath } from '@/utils/objects'
import type { ProcessTemplate } from './processTemplate'
import type { RootAction, StepAction } from './types'

export const createAppendAction = (id: string, label: string, onExecute: () => void) => ({
  id: `root-action-${id}`,
  label: label,
  execute: onExecute,
})

export const parseStepAction = (action: StepAction, strings: Record<string, unknown>) => ({
  id: action.id,
  label: getValueAtPath(strings, action.labelText),
  targetType: action.targetType,
  trigger: action.trigger,
})

export const parseRootAction = (action: RootAction, strings: Record<string, unknown>) => ({
  id: action.id,
  label: getValueAtPath(strings, action.labelText),
  targetType: action.targetType,
  trigger: action.trigger,
})

export interface ParsedAction {
  id: string
  label: string
  targetType: string
  trigger: 'append' | 'advance'
}

export const getCanvasRootActions = (
  template: ProcessTemplate,
  existingSteps: Array<{ stepId: string }>,
  strings: Record<string, unknown>
): ParsedAction[] => {
  const stepDefMap = new Map(template.stepDefinitions.map((def) => [def.id, def]))

  const existingStepTypes = new Set(existingSteps.map((step) => step.stepId))

  return template.rootActions
    .filter((action) => {
      const stepDef = stepDefMap.get(action.targetType)
      if (!stepDef?.ui.visibility.includes('canvas')) return false
      if (existingStepTypes.has(action.targetType)) return false
      return true
    })
    .map((action) => parseRootAction(action, strings))
}

export const parseRootActions = (template: ProcessTemplate, strings: Record<string, unknown>) =>
  template.rootActions.map((action) => parseRootAction(action, strings))

export const parseStepDefinitions = (template: ProcessTemplate, strings: Record<string, unknown>) =>
  template.stepDefinitions.map(({ id, actions }) => ({
    id,
    actions: actions.map((action) => parseStepAction(action, strings)),
  }))
