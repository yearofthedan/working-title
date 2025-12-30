import type { StepCategory } from '@/features/shared/storySpec'

export interface LayoutEdge {
  id: string
  source: string
  target: string
}

export interface LayoutNode {
  id: string
  width: number
  height: number
}

export interface CanvasNodeSpec {
  stepId: string
  stage: number
  category: StepCategory
  content: string
  label: string
}

export interface CanvasLayoutNode extends LayoutNode {
  type: string
  spec: CanvasNodeSpec
}
