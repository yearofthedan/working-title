import type { StepCategory } from "@/features/process-templates/processTemplate"
import type { ActionDefinition } from "./useStepActions"

export interface CanvasNode {
  id: string
  stepId: string
  stage?: number
  category: StepCategory
  sortOrder: number
  actions?: ActionDefinition[]
}

export interface CanvasEdge {
  id: string
  source: string
  target: string
}

export type Track = {
  id: string
  offset: number
  nodes: CanvasNode[]
}

export interface TracksViewModel {
  tracks: Track[]
  edges: CanvasEdge[]
  sortingConfig: {
    stepOrder: string[]
  }
}

export interface ViewModel {
  tracks: TracksViewModel
  sidebar: {
    nodes: SidebarNode[]
  }
}

export interface SidebarNode {
  id: string
  stepId: string
}
