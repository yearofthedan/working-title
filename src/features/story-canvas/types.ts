import type { Edge, Node } from '@vue-flow/core'

export interface SidebarNode {
  id: string
  label: string
  content: string
  placeholder?: string
  instruction?: string
}

export interface ViewModel<NodeData> {
  canvas: {
    nodes: Node<NodeData>[]
    edges: Edge[]
  }
  sidebar: {
    nodes: SidebarNode[]
  }
}
