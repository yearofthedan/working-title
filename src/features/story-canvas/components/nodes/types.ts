import type { StepCategory } from '@/features/process-templates/processTemplate'

export interface RichTextNodeDefinition {
  label: string
  placeholder?: string
  hint?: string
  category?: StepCategory
}

export interface RichTextNodeContent {
  text: string
}
