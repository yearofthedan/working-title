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
})

export const parseRootAction = (action: RootAction, strings: Record<string, unknown>) => ({
  id: action.id,
  label: getValueAtPath(strings, action.labelText),
  targetType: action.targetType,
})

export const parseRootActions = (template: ProcessTemplate, strings: Record<string, unknown>) =>
  template.rootActions.map((action) => parseRootAction(action, strings))

export const parseStepDefinitions = (template: ProcessTemplate, strings: Record<string, unknown>) =>
  template.stepDefinitions.map(({ id, actions }) => ({
    id,
    actions: actions.map((action) => parseStepAction(action, strings)),
  }))
