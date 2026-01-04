import type { Node } from '@vue-flow/core'
import type { ProjectData, Step, Connection } from '@/features/shared/projectDataSpec'
import type {
  ProcessTemplate,
  StepCategory,
  StepDefinition,
} from '@/features/shared/processTemplateSpec'
import { getValueAtPath } from '@/utils/objects'
import { runLayout } from '@/features/shared/layout/elk'
import {
  buildTrackLayout,
  type NodeData,
  type CanvasNode,
  type CanvasEdge,
} from '@/features/story-canvas/model/trackLayout'
import type { ViewModel } from '@/features/story-canvas/types'

const NODE_WIDTH = 400
const DEFAULT_NODE_HEIGHT = 100

// todo bind this to the css settings for the story canvas
const MAX_CHARS_PER_LINE = 75
const EST_NODE_HEIGHT_PER_LINE = 20
const getEstimatedNodeHeight = (content: string): number => {
  const charCount = content.length
  return DEFAULT_NODE_HEIGHT + Math.ceil(charCount / MAX_CHARS_PER_LINE) * EST_NODE_HEIGHT_PER_LINE
}

const mapToSidebar = (
  steps: Step[],
  stepDefinitionMap: Map<string, StepDefinition>,
  strings: Record<string, unknown>
): ViewModel<NodeData>['sidebar'] => {
  return {
    nodes: steps.map((step) => {
      const stepDfn = stepDefinitionMap.get(step.stepId)
      return {
        id: step.id,
        label: getValueAtPath(strings, stepDfn?.labelText ?? step.stepId) as string,
        content: step.content.text,
      }
    }),
  }
}

const toCanvasNode = (
  step: Step,
  stepDefinitionMap: Map<string, StepDefinition>,
  strings: Record<string, unknown>
): CanvasNode => {
  const stepDefinition = stepDefinitionMap.get(step.stepId)
  const label = stepDefinition
    ? (getValueAtPath(strings, stepDefinition.labelText) as string)
    : step.stepId
  const stage = stepDefinition?.stage

  return {
    id: step.id,
    width: NODE_WIDTH,
    height: getEstimatedNodeHeight(step.content.text),
    stepData: {
      stepId: step.stepId,
      stage,
      type: stepDefinition?.editorConfig?.format === 'plain' ? 'plainText' : 'richText',
      category: stepDefinition?.category as StepCategory,
      content: step.content.text,
      label,
    },
  }
}

const toVueFlowNode = (
  canvasNode: CanvasNode,
  position: { x: number; y: number }
): Node<NodeData> => ({
  id: canvasNode.id,
  type: canvasNode.stepData.type,
  position,
  data: {
    label: canvasNode.stepData.label,
    content: canvasNode.stepData.content,
    category: canvasNode.stepData.category,
    stepId: canvasNode.stepData.stepId,
    stage: canvasNode.stepData.stage,
  },
})

const connectsRealNodes =
  (stepIds: Set<string>) =>
  (connection: Connection): boolean => {
    return stepIds.has(connection.source) && stepIds.has(connection.target)
  }

const mapToCanvas = async (
  steps: Step[],
  connections: Connection[],
  stepDefinitionMap: Map<string, StepDefinition>,
  template: ProcessTemplate,
  strings: Record<string, unknown>
): Promise<ViewModel<NodeData>['canvas']> => {
  const canvasNodes = steps.map(
    (n: Step): CanvasNode => toCanvasNode(n, stepDefinitionMap, strings)
  )
  const canvasEdges: CanvasEdge[] = connections.map((c) => ({
    id: c.id,
    source: c.source,
    target: c.target,
    type: 'smoothstep',
  }))

  const stepOrder = Array.from(stepDefinitionMap.keys())

  const { tracks, nodeLayers } = buildTrackLayout(
    canvasNodes,
    canvasEdges,
    template.ui?.tracks,
    template.ui?.trackOffsets
  )

  const positions = await runLayout(tracks, {
    layerSelector: (node: CanvasNode) => nodeLayers.get(node.id)!,
    nodeComparator: (a, b) => {
      const stageDiff = (a.stepData.stage ?? 0) - (b.stepData.stage ?? 0)
      if (stageDiff !== 0) return stageDiff

      return stepOrder.indexOf(a.stepData.stepId) - stepOrder.indexOf(b.stepData.stepId)
    },
  })

  const canvasNodesById = new Map(canvasNodes.map((n) => [n.id, n]))
  const nodes: Node<NodeData>[] = Array.from(positions.entries()).flatMap(([nodeId, pos]) => {
    const canvasNode = canvasNodesById.get(nodeId)
    return canvasNode ? [toVueFlowNode(canvasNode, pos)] : []
  })

  return { nodes, edges: canvasEdges }
}

export const mapProjectToViewModel = async (
  projectData: ProjectData,
  template: ProcessTemplate,
  strings: Record<string, unknown>
): Promise<ViewModel<NodeData>> => {
  const stepDefinitionMap = new Map(template.stepDefinitions.map((s) => [s.id, s]))
  const validSteps = projectData.steps.filter((s) => stepDefinitionMap.has(s.stepId))
  const canvasSteps = validSteps.filter((s) =>
    stepDefinitionMap.get(s.stepId)?.ui.visibility.includes('canvas')
  )
  const canvasStepIds = new Set(canvasSteps.map((s) => s.id))
  const canvas = await mapToCanvas(
    canvasSteps,
    projectData.connections.filter(connectsRealNodes(canvasStepIds)),
    stepDefinitionMap,
    template,
    strings
  )

  const sidebarSteps = validSteps.filter((s) =>
    stepDefinitionMap.get(s.stepId)?.ui?.visibility?.includes('sidebar')
  )
  const sidebar = mapToSidebar(sidebarSteps, stepDefinitionMap, strings)

  return { canvas, sidebar }
}
