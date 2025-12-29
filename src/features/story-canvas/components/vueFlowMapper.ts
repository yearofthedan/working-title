import type { StoryCanvasProject } from '@features/shared/dataSpec'
import type { NarrativeTemplate } from '@features/shared/storySpec'
import dagre from 'dagre'
import { getValueAtPath } from '@/utils/objects'
import type { Edge } from '@vue-flow/core'
import type { Node } from '@vue-flow/core'
import { partition } from '@/utils/arrays'

export interface NodeData {
  label: string
  content: string
}

export interface SidebarNode {
  id: string
  label: string
  content: string
}

export interface MappedStoryProject {
  nodes: Node[]
  edges: Edge[]
  sidebarNodes: SidebarNode[]
}

export const mapProjectToVueFlowElements = (
  data: StoryCanvasProject,
  template: NarrativeTemplate,
  strings: Record<string, unknown>
): MappedStoryProject => {
  const [contextNodes, canvasNodes] = partition(
    data.nodes.filter((n) => template.steps[n.stepId] !== undefined),
    (n) => template.steps[n.stepId]?.category === 'context'
  )

  const sidebarNodes: SidebarNode[] = contextNodes.map((node) => ({
    id: node.id,
    label: getValueAtPath(strings, template.steps[node.stepId]?.labelText ?? node.stepId) as string,
    content: node.content.text,
  }))

  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 150, ranksep: 100 })
  const nodeWidth = 400

  const mappedNodes = canvasNodes.map((node) => {
    const step = template.steps[node.stepId]
    return {
      id: node.id,
      type: step?.content.contentType ?? 'richText',
      category: step?.category,
      data: {
        label: step ? getValueAtPath(strings, step.labelText) : node.stepId,
        content: node.content.text,
      },
    }
  })

  mappedNodes.forEach((node) => {
    const charCount = node.data.content.length
    const estimatedHeight = 100 + Math.ceil(charCount / 60) * 20
    dagreGraph.setNode(node.id, { width: nodeWidth, height: estimatedHeight })
  })

  const edges: Edge[] = data.edges.map((edge) => {
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
    }
  })
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  let mainFlowRightEdge = 0
  mappedNodes.forEach((node) => {
    if (node.category !== 'character') {
      const pos = dagreGraph.node(node.id)
      mainFlowRightEdge = Math.max(mainFlowRightEdge, pos.x + nodeWidth / 2)
    }
  })

  const characterOffset = mainFlowRightEdge + 200 // 200px gap

  const vueFlowNodes: Node[] = mappedNodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id)
    const width = dagreNode.width
    const height = dagreNode.height
    let x = dagreNode.x - width / 2
    const y = dagreNode.y - height / 2

    if (node.category === 'character') {
      x = characterOffset + dagreNode.x
    }

    return {
      ...node,
      position: { x, y },
    }
  })

  return { nodes: vueFlowNodes, edges: edges, sidebarNodes: sidebarNodes }
}
