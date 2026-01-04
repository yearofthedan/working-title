import type { LayoutTrack } from '@/features/shared/layout/types'
import type { StepCategory } from '@/features/shared/processTemplateSpec'

export interface NodeData {
  label: string
  content: string
  category: StepCategory
  stepId?: string
  stage?: number
}

export interface CanvasEdge {
  id: string
  source: string
  target: string
}

export interface CanvasStepData {
  stepId: string
  stage?: number
  type: 'plainText' | 'richText'
  category: StepCategory
  content: string
  label: string
}

export interface CanvasNode {
  id: string
  stepData: CanvasStepData
  width: number
  height: number
}

const buildAdjacencyList = (edges: CanvasEdge[]): Map<string, string[]> => {
  const adjacency = new Map<string, string[]>()
  edges.forEach((e) => {
    const existing = adjacency.get(e.source) ?? []
    existing.push(e.target)
    adjacency.set(e.source, existing)
  })
  return adjacency
}

const groupNodesByStepId = (nodes: CanvasNode[]): Map<string, CanvasNode[]> => {
  const map = new Map<string, CanvasNode[]>()
  nodes.forEach((n) => {
    const stepId = n.stepData.stepId
    const existing = map.get(stepId) ?? []
    existing.push(n)
    map.set(stepId, existing)
  })
  return map
}

/**
 * Derive which track each node belongs to via BFS from track roots.
 * Nodes reachable from a track's root stepIds belong to that track.
 */
const deriveTrackMembership = (
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  tracks: Record<string, string[]> | undefined
): Map<string, string> => {
  const nodeToTrack = new Map<string, string>()
  if (!tracks) return nodeToTrack

  const adjacency = buildAdjacencyList(edges)
  const nodesByStepId = groupNodesByStepId(nodes)
  const queue: { id: string; track: string }[] = []

  // Seed the queue with all roots at once
  Object.entries(tracks).forEach(([trackName, rootStepIds]) => {
    rootStepIds.forEach((stepId) => {
      nodesByStepId.get(stepId)?.forEach((n) => {
        if (!nodeToTrack.has(n.id)) {
          nodeToTrack.set(n.id, trackName)
          queue.push({ id: n.id, track: trackName })
        }
      })
    })
  })

  // Single pass BFS
  while (queue.length > 0) {
    const { id, track } = queue.shift()!
    adjacency.get(id)?.forEach((childId) => {
      if (!nodeToTrack.has(childId)) {
        nodeToTrack.set(childId, track)
        queue.push({ id: childId, track })
      }
    })
  }

  return nodeToTrack
}

/** Orphan nodes (not reachable from any track root) fall back to the default track. */
const groupNodesByTrack = (
  nodes: CanvasNode[],
  nodeToTrack: Map<string, string>,
  defaultTrack: string
): Map<string, CanvasNode[]> => {
  const nodesByTrack = new Map<string, CanvasNode[]>()

  nodes.forEach((node) => {
    const trackName = nodeToTrack.get(node.id) ?? defaultTrack
    const existing = nodesByTrack.get(trackName) ?? []
    existing.push(node)
    nodesByTrack.set(trackName, existing)
  })

  return nodesByTrack
}

const prepareTrackInputs = (
  nodesByTrack: Map<string, CanvasNode[]>,
  trackNames: string[],
  edges: CanvasEdge[]
): LayoutTrack<CanvasNode>[] => {
  return trackNames
    .filter((trackName) => (nodesByTrack.get(trackName) ?? []).length > 0)
    .map((trackName) => {
      const trackNodes = nodesByTrack.get(trackName) ?? []
      const trackNodeIds = new Set(trackNodes.map((n) => n.id))

      // Do not include cross-track edges in order to keep the tracks isolated in the calculation
      const trackEdges = edges.filter(
        (e) => trackNodeIds.has(e.source) && trackNodeIds.has(e.target)
      )

      return { trackName, nodes: trackNodes, edges: trackEdges }
    })
}

const extractTrackNames = (tracks: Record<string, string[]> = {}): string[] => {
  return Object.keys(tracks)
}

/**
 * Calculate the layer for each node based on track membership and offsets.
 * Track offset defines the starting layer; nodes are placed relative based on stage differences.
 */
const calculateNodeLayers = (
  trackInputs: LayoutTrack<CanvasNode>[],
  trackOffsets: Record<string, number> = {}
): Map<string, number> => {
  const nodeLayers = new Map<string, number>()

  trackInputs.forEach((track) => {
    const trackOffset = trackOffsets[track.trackName] ?? 0
    const minStage = Math.min(...track.nodes.map((n) => n.stepData.stage ?? 0))

    track.nodes.forEach((node) => {
      nodeLayers.set(node.id, trackOffset + (node.stepData.stage ?? 0 - minStage))
    })
  })

  return nodeLayers
}

export interface TrackLayoutResult {
  tracks: LayoutTrack<CanvasNode>[]
  nodeLayers: Map<string, number>
}

export const buildTrackLayout = (
  layoutNodes: CanvasNode[],
  edges: CanvasEdge[],
  tracks?: Record<string, string[]>,
  trackOffsets?: Record<string, number>
): TrackLayoutResult => {
  const trackNames = extractTrackNames(tracks)
  const defaultTrack = trackNames[0]

  let trackInputs: LayoutTrack<CanvasNode>[]

  if (!defaultTrack) {
    // No tracks defined — single implicit track with all nodes
    trackInputs = prepareTrackInputs(new Map([['_default', layoutNodes]]), ['_default'], edges)
  } else {
    const nodesByTrack = groupNodesByTrack(
      layoutNodes,
      deriveTrackMembership(layoutNodes, edges, tracks),
      defaultTrack
    )
    trackInputs = prepareTrackInputs(nodesByTrack, trackNames, edges)
  }

  const nodeLayers = calculateNodeLayers(trackInputs, trackOffsets)

  return { tracks: trackInputs, nodeLayers }
}
