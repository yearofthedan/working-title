import type { LayoutTrack } from '@/features/shared/layout/types'
import type { CanvasLayoutNode, LayoutEdge } from './types'

export interface NodeData {
  label: string
  content: string
  stepId?: string
  stage?: number
}

const buildAdjacencyList = (edges: LayoutEdge[]): Map<string, string[]> => {
  const adjacency = new Map<string, string[]>()
  edges.forEach((e) => {
    const existing = adjacency.get(e.source) ?? []
    existing.push(e.target)
    adjacency.set(e.source, existing)
  })
  return adjacency
}

const groupNodesByStepId = (nodes: CanvasLayoutNode[]): Map<string, CanvasLayoutNode[]> => {
  const map = new Map<string, CanvasLayoutNode[]>()
  nodes.forEach((n) => {
    const stepId = n.spec.stepId
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
  nodes: CanvasLayoutNode[],
  edges: LayoutEdge[],
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
  nodes: CanvasLayoutNode[],
  nodeToTrack: Map<string, string>,
  defaultTrack: string
): Map<string, CanvasLayoutNode[]> => {
  const nodesByTrack = new Map<string, CanvasLayoutNode[]>()

  nodes.forEach((node) => {
    const trackName = nodeToTrack.get(node.id) ?? defaultTrack
    const existing = nodesByTrack.get(trackName) ?? []
    existing.push(node)
    nodesByTrack.set(trackName, existing)
  })

  return nodesByTrack
}

const prepareTrackInputs = (
  nodesByTrack: Map<string, CanvasLayoutNode[]>,
  trackNames: string[],
  edges: LayoutEdge[]
): LayoutTrack<CanvasLayoutNode>[] => {
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
  trackInputs: LayoutTrack<CanvasLayoutNode>[],
  trackOffsets: Record<string, number> = {}
): Map<string, number> => {
  const nodeLayers = new Map<string, number>()

  trackInputs.forEach((track) => {
    const trackOffset = trackOffsets[track.trackName] ?? 0
    const minStage = Math.min(...track.nodes.map((n) => n.spec.stage))

    track.nodes.forEach((node) => {
      nodeLayers.set(node.id, trackOffset + (node.spec.stage - minStage))
    })
  })

  return nodeLayers
}

export interface TrackLayoutResult {
  tracks: LayoutTrack<CanvasLayoutNode>[]
  nodeLayers: Map<string, number>
}

export const buildTrackLayout = (
  layoutNodes: CanvasLayoutNode[],
  edges: LayoutEdge[],
  tracks?: Record<string, string[]>,
  trackOffsets?: Record<string, number>
): TrackLayoutResult => {
  const trackNames = extractTrackNames(tracks)
  const defaultTrack = trackNames[0]

  let trackInputs: LayoutTrack<CanvasLayoutNode>[]

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
