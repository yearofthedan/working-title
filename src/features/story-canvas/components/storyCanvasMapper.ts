import type { Edge, Node } from '@vue-flow/core'
import type { StoryProject, StoryProjectNode, StoryProjectEdge } from '@features/shared/dataSpec'
import type { NarrativeTemplate, StepCategory } from '@features/shared/storySpec'
import { getValueAtPath } from '@/utils/objects'
import { partition } from '@/utils/arrays'
import { runLayout } from '@/features/shared/layout/elk'
import { buildTrackInputs, type NodeData } from '../layout/trackLayout'
import type { CanvasLayoutNode, LayoutEdge } from '../layout/types'

const NODE_WIDTH = 400
const DEFAULT_NODE_HEIGHT = 100

export interface SidebarNode {
  id: string
  label: string
  content: string
}

interface MappedStoryProject {
  canvas: {
    nodes: Node[]
    edges: Edge[]
  }
  sidebar: {
    nodes: SidebarNode[]
  }
}

const MAX_CHARS_PER_LINE = 60
const EST_NODE_HEIGHT_PER_LINE = 20
const getEstimatedNodeHeight = (content: string): number => {
  const charCount = content.length
  return DEFAULT_NODE_HEIGHT + Math.ceil(charCount / MAX_CHARS_PER_LINE) * EST_NODE_HEIGHT_PER_LINE
}

const partitionCanvasAndContextNodes = (
  nodes: StoryProjectNode[],
  template: NarrativeTemplate
): [StoryProjectNode[], StoryProjectNode[]] => {
  return partition(nodes, (n) => template.steps[n.stepId]?.category === 'context')
}

const mapToSidebar = (
  projectContextNodes: StoryProjectNode[],
  template: NarrativeTemplate,
  strings: Record<string, unknown>
): MappedStoryProject['sidebar'] => {
  return {
    nodes: projectContextNodes.map((node) => ({
      id: node.id,
      label: getValueAtPath(
        strings,
        template.steps[node.stepId]?.labelText ?? node.stepId
      ) as string,
      content: node.content.text,
    })),
  }
}

const toLayoutNode = (
  node: StoryProjectNode,
  template: NarrativeTemplate,
  strings: Record<string, unknown>
): CanvasLayoutNode => {
  const step = template.steps[node.stepId]
  const label = step ? (getValueAtPath(strings, step.labelText) as string) : node.stepId
  const stage = step?.stage ?? 0

  return {
    id: node.id,
    width: NODE_WIDTH,
    height: getEstimatedNodeHeight(node.content.text),
    type: step?.content.contentType ?? 'richText',
    spec: {
      stepId: node.stepId,
      stage,
      category: step?.category as StepCategory,
      content: node.content.text,
      label,
    },
  }
}

const toVueFlowNode = (
  layoutNode: CanvasLayoutNode,
  position: { x: number; y: number }
): Node<NodeData> => ({
  id: layoutNode.id,
  type: layoutNode.type,
  position,
  data: {
    label: layoutNode.spec.label,
    content: layoutNode.spec.content,
    stepId: layoutNode.spec.stepId,
    stage: layoutNode.spec.stage,
  },
})

const connectsRealNodes =
  (nodeById: Set<string>) =>
  (edge: StoryProjectEdge): boolean => {
    return nodeById.has(edge.source) && nodeById.has(edge.target)
  }

const mapToCanvas = async (
  projectCanvasNodes: StoryProjectNode[],
  projectCanvasEdges: StoryProjectEdge[],
  template: NarrativeTemplate,
  strings: Record<string, unknown>
): Promise<MappedStoryProject['canvas']> => {
  const layoutNodes = projectCanvasNodes.map(
    (n: StoryProjectNode): CanvasLayoutNode => toLayoutNode(n, template, strings)
  )
  const layoutEdges: LayoutEdge[] = projectCanvasEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
  }))

  const stepRank = Object.fromEntries(Object.keys(template.steps).map((id, index) => [id, index]))

  const trackInputs = buildTrackInputs(layoutNodes, layoutEdges, template.layout?.tracks)
  const positions = await runLayout(trackInputs, {
    layerSelector: (node: CanvasLayoutNode) => node.spec.stage,
    nodeComparator: (a, b) => {
      const stageDiff = a.spec.stage - b.spec.stage
      if (stageDiff !== 0) return stageDiff
      return (stepRank[a.spec.stepId] ?? 0) - (stepRank[b.spec.stepId] ?? 0)
    },
  })

  const nodeById = new Map(layoutNodes.map((n) => [n.id, n]))
  const nodes: Node<NodeData>[] = Array.from(positions.entries()).flatMap(([nodeId, pos]) => {
    const layoutNode = nodeById.get(nodeId)
    return layoutNode ? [toVueFlowNode(layoutNode, pos)] : []
  })

  return { nodes, edges: layoutEdges }
}

export const mapProjectToVueFlow = async (
  projectData: StoryProject,
  template: NarrativeTemplate,
  strings: Record<string, unknown>
): Promise<MappedStoryProject> => {
  const [projectContextNodes, projectCanvasNodes] = partitionCanvasAndContextNodes(
    projectData.nodes.filter((n) => template.steps[n.stepId] !== undefined),
    template
  )

  const canvasNodeIds = new Set(projectCanvasNodes.map((n) => n.id))
  const sanitizedCanvasEdges = projectData.edges.filter(connectsRealNodes(canvasNodeIds))

  const sidebar = mapToSidebar(projectContextNodes, template, strings)
  const canvas = await mapToCanvas(projectCanvasNodes, sanitizedCanvasEdges, template, strings)

  return { canvas, sidebar }
}
