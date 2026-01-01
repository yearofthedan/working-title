import type { Edge, Node } from '@vue-flow/core'

export interface SidebarNode {
  id: string
  label: string
  content: string
}

export interface ViewModel {
  canvas: {
    nodes: Node[]
    edges: Edge[]
  }
  sidebar: {
    nodes: SidebarNode[]
  }
}
