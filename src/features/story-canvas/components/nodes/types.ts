import type { StepCategory } from '@/features/process-templates/processTemplate'
import type { ActionDefinition } from '@/features/story/composables/useStepActions'

export interface RichTextNodeDefinition {
  label: string
  placeholder?: string
  hint?: string
  category?: StepCategory
}

export interface RichTextNodeContent {
  text: string
}

export interface RichTextNodeProps {
  id: string
  definition: RichTextNodeDefinition
  content: RichTextNodeContent
  actions?: ActionDefinition[]
}
