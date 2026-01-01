import type { Edge, Node } from '@vue-flow/core'
import type { StoryProject, StoryProjectNode, StoryProjectEdge } from '@features/shared/dataSpec'
import type { NarrativeTemplate, StepCategory, StepDefinition } from '@features/shared/storySpec'
import { getValueAtPath } from '@/utils/objects'
import { runLayout } from '@/features/shared/layout/elk'
import { buildTrackLayout, type NodeData } from '../layout/trackLayout'
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

// todo bind this to the css settings for the story canvas
const MAX_CHARS_PER_LINE = 75
const EST_NODE_HEIGHT_PER_LINE = 20
const getEstimatedNodeHeight = (content: string): number => {
  const charCount = content.length
  return DEFAULT_NODE_HEIGHT + Math.ceil(charCount / MAX_CHARS_PER_LINE) * EST_NODE_HEIGHT_PER_LINE
}

const mapToSidebar = (
  projectSidebarNodes: StoryProjectNode[],
  stepMap: Map<string, StepDefinition>,
  strings: Record<string, unknown>
): MappedStoryProject['sidebar'] => {
  return {
    nodes: projectSidebarNodes.map((node) => {
      const step = stepMap.get(node.stepId)
      return {
        id: node.id,
        label: getValueAtPath(strings, step?.labelText ?? node.stepId) as string,
        content: node.content.text,
      }
    }),
  }
}

const toLayoutNode = (
  node: StoryProjectNode,
  stepMap: Map<string, StepDefinition>,
  strings: Record<string, unknown>
): CanvasLayoutNode => {
  const step = stepMap.get(node.stepId)
  const label = step ? (getValueAtPath(strings, step.labelText) as string) : node.stepId
  const stage = step?.stage ?? 0

  return {
    id: node.id,
    width: NODE_WIDTH,
    height: getEstimatedNodeHeight(node.content.text),
    type: step?.content.format === 'plain' ? 'plainText' : 'richText',
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
  stepMap: Map<string, StepDefinition>,
  template: NarrativeTemplate,
  strings: Record<string, unknown>
): Promise<MappedStoryProject['canvas']> => {
  const layoutNodes = projectCanvasNodes.map(
    (n: StoryProjectNode): CanvasLayoutNode => toLayoutNode(n, stepMap, strings)
  )
  const layoutEdges: LayoutEdge[] = projectCanvasEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'smoothstep',
  }))

  const stepOrder = Array.from(stepMap.keys())

  const { tracks, nodeLayers } = buildTrackLayout(
    layoutNodes,
    layoutEdges,
    template.ui?.tracks,
    template.ui?.trackOffsets
  )

  const positions = await runLayout(tracks, {
    layerSelector: (node: CanvasLayoutNode) => nodeLayers.get(node.id)!,
    nodeComparator: (a, b) => {
      const stageDiff = a.spec.stage - b.spec.stage
      if (stageDiff !== 0) return stageDiff

      return stepOrder.indexOf(a.spec.stepId) - stepOrder.indexOf(b.spec.stepId)
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
  const stepMap = new Map(template.steps.map((s) => [s.id, s]))
  const validNodes = projectData.nodes.filter((n) => stepMap.has(n.stepId))
  const projectSidebarNodes = validNodes.filter((n) =>
    stepMap.get(n.stepId)?.ui?.visibility?.includes('sidebar')
  )
  const projectCanvasNodes = validNodes.filter((n) =>
    stepMap.get(n.stepId)?.ui?.visibility?.includes('canvas')
  )
  const canvasNodeIds = new Set(projectCanvasNodes.map((n) => n.id))
  const sanitizedCanvasEdges = projectData.edges.filter(connectsRealNodes(canvasNodeIds))

  const sidebar = mapToSidebar(projectSidebarNodes, stepMap, strings)
  const canvas = await mapToCanvas(
    projectCanvasNodes,
    sanitizedCanvasEdges,
    stepMap,
    template,
    strings
  )

  return { canvas, sidebar }
}
