import type { StepCategory } from '@/features/process-templates/processTemplate'
import type { ActionDefinition } from '../view-model/useStepActions'

export interface CanvasStepDefinition {
  label: string
  placeholder?: string
  hint?: string
  category?: StepCategory
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
