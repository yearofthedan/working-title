import type { ProcessTemplate } from './processTemplate'
import type { RootAction } from './types'

export const createAppendAction = (id: string, label: string, onExecute: () => void) => ({
  id: `root-action-${id}`,
  label: label,
  execute: onExecute,
})

export interface ParsedAction {
  id: string
  labelText: string
  targetType: string
  trigger: 'append' | 'advance'
}

// todo should this somehow merge/be replaced by useStepActions? or useStepActions split to useRootActions?
export const getCanvasRootActions = (
  template: ProcessTemplate,
  existingSteps: Array<{ stepId: string }>
): RootAction[] => {
  const existingStepTypes = new Set(existingSteps.map((s) => s.stepId))

  return template.rootActions.filter((action) => {
    const stepDef = template.stepDefinitions.find((d) => d.id === action.targetType)

    if (
      !stepDef ||
      !stepDef.ui.visibility.includes('canvas') ||
      existingStepTypes.has(action.targetType)
    ) {
      return false
    }

    return true
  })
}
