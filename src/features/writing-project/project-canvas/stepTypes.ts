import type { StepCategory, StepScope } from '@/features/process-templates/processTemplate'
import type { ActionDefinition } from '../composables/useStepActions'

export interface CanvasStepDefinition {
  label: string
  placeholder?: string
  hint?: string
  category?: StepCategory
  scope?: StepScope
}

export interface CanvasStepContent {
  text: string
}

export interface CanvasStepProps {
  id: string
  definition: CanvasStepDefinition
  content: CanvasStepContent
  actions?: ActionDefinition[]
}
