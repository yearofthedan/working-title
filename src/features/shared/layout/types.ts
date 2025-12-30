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

export interface LayoutTrack<T extends LayoutNode> {
  trackName: string
  nodes: T[]
  edges: LayoutEdge[]
}
