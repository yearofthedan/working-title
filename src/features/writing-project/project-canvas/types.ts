import type { StepCategory } from '@/features/process-templates/processTemplate'
import type { ActionDefinition } from '../view-model/useStepActions'

export interface BasicCanvasNode {
  id: string
  stepId: string
  stage?: number
  category: StepCategory
  sortOrder: number
}

export interface CanvasEdge {
  id: string
  source: string
  target: string
}

export type Track = {
  id: string
  offset: number
  nodes: BasicCanvasNode[]
}

export interface CanvasViewModel {
  tracks: Track[]
  edges: CanvasEdge[]
  nodeMap: Map<string, EnrichedCanvasNode>
}

export interface EnrichedCanvasNode {
  id: string
  stepId: string
  label: string
  placeholder: string
  instruction: string
  content: string
  category: StepCategory
  stage?: number
  actions: ActionDefinition[]
  editorFormat: 'plain' | 'rich'
}
