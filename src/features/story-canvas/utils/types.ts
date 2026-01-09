export interface LayoutEdge {
  id: string
  source: string
  target: string
}

export interface LayoutTrack<T> {
  trackName: string
  nodes: T[]
  edges: LayoutEdge[]
}

export type LayoutNode = {
  id: string
  width: number
  height: number
  sortOrder: number
  stage?: number
}
