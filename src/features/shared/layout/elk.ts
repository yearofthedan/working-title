import ELK from 'elkjs/lib/elk.bundled.js'
import type { LayoutNode, LayoutTrack } from './types'

const elk = new ELK()

export const TRACK_GAP = 250

const HIDDEN_ROOT_PREFIX = '__hidden_root_track_'

const BASE_LAYOUT_OPTIONS = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': '100',
  'elk.layered.spacing.nodeNodeBetweenLayers': '150',
}

export interface LayoutOptions<T extends LayoutNode> {
  /** Extract layer/rank for vertical grouping of disconnected roots */
  layerSelector: (node: T) => number
  /** Comparator for horizontal ordering within a layer */
  nodeComparator: (a: T, b: T) => number
}

interface TrackLayoutData {
  elkNodes: ElkNode[]
  hiddenIds: Set<string>
  layoutPromise: Promise<ElkLayoutResult>
}

// Internal ELK types — not exported
interface ElkNode {
  id: string
  width: number
  height: number
  _layer?: number
}

interface ElkEdge {
  id: string
  sources: string[]
  targets: string[]
}

interface ElkLayoutResult {
  children?: Array<{ id: string; x?: number; y?: number; width?: number }>
}

/**
 * Build hidden graph structure to force disconnected root nodes to align properly.
 *
 * Problem: If a track has roots at different layers, ELK places them at arbitrary
 * depths since they're not connected.
 *
 * Solution: Create a hidden "bridge chain" connecting layers sequentially.
 */
const buildHiddenGraph = (
  elkNodes: ElkNode[],
  edges: ElkEdge[],
  trackIndex: number
): { hiddenNodes: ElkNode[]; hiddenEdges: ElkEdge[] } => {
  const hiddenRootId = `${HIDDEN_ROOT_PREFIX}${trackIndex}`
  const hasIncomingEdge = new Set(edges.map((e) => e.targets[0]))
  const rootNodeIds = new Set(elkNodes.filter((n) => !hasIncomingEdge.has(n.id)).map((n) => n.id))

  // Group roots by layer
  const layerToRoots = new Map<number, string[]>()
  elkNodes.forEach((node) => {
    if (!rootNodeIds.has(node.id)) return
    const layer = node._layer ?? 0
    const existing = layerToRoots.get(layer) ?? []
    existing.push(node.id)
    layerToRoots.set(layer, existing)
  })

  const hiddenRootNode: ElkNode = { id: hiddenRootId, width: 0, height: 0 }
  const hiddenNodes: ElkNode[] = [hiddenRootNode]
  const hiddenEdges: ElkEdge[] = []

  const layers = Array.from(layerToRoots.keys()).sort((a, b) => a - b)
  let previousBridgeId = hiddenRootId

  layers.forEach((layer, index) => {
    const rootIds = layerToRoots.get(layer) ?? []

    if (index === 0) {
      rootIds.forEach((targetId, i) => {
        hiddenEdges.push({
          id: `__track${trackIndex}_root_edge_${layer}_${i}`,
          sources: [hiddenRootId],
          targets: [targetId],
        })
      })
    } else {
      const bridgeId = `__track${trackIndex}_bridge_layer_${layer}__`
      hiddenNodes.push({ id: bridgeId, width: 0, height: 0 })

      hiddenEdges.push({
        id: `__track${trackIndex}_bridge_chain_${layer}`,
        sources: [previousBridgeId],
        targets: [bridgeId],
      })

      rootIds.forEach((targetId, i) => {
        hiddenEdges.push({
          id: `__track${trackIndex}_bridge_edge_${layer}_${i}`,
          sources: [bridgeId],
          targets: [targetId],
        })
      })

      previousBridgeId = bridgeId
    }
  })

  return { hiddenNodes, hiddenEdges }
}

/**
 * Run ELK layout for multiple tracks, returning positions.
 * All ELK-specific logic (hidden nodes, conversion, options) is encapsulated here.
 * Includes per-track layer alignment to prevent cross-track overlap.
 */
export const runLayout = async <T extends LayoutNode>(
  tracks: LayoutTrack<T>[],
  options: LayoutOptions<T>
): Promise<Map<string, { x: number; y: number }>> => {
  const { layerSelector, nodeComparator } = options
  const positions = new Map<string, { x: number; y: number }>()

  // Prepare all track layouts
  const trackData: TrackLayoutData[] = tracks.map((track, trackIndex) => {
    const elkNodes: ElkNode[] = track.nodes.map((node) => ({
      id: node.id,
      width: node.width,
      height: node.height,
      _layer: layerSelector(node),
    }))

    const elkEdges: ElkEdge[] = track.edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    }))

    // Sort nodes using provided comparator
    const nodeById = new Map(track.nodes.map((n) => [n.id, n]))
    elkNodes.sort((a, b) => {
      const nodeA = nodeById.get(a.id)
      const nodeB = nodeById.get(b.id)
      if (!nodeA || !nodeB) return 0
      return nodeComparator(nodeA, nodeB)
    })

    const { hiddenNodes, hiddenEdges } = buildHiddenGraph(elkNodes, elkEdges, trackIndex)
    const hiddenIds = new Set(hiddenNodes.map((n) => n.id))

    const layoutPromise = elk.layout({
      id: `track-${track.trackName}`,
      layoutOptions: {
        ...BASE_LAYOUT_OPTIONS,
        'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
      },
      children: [...hiddenNodes, ...elkNodes],
      edges: [...hiddenEdges, ...elkEdges],
    }) as Promise<ElkLayoutResult>

    return { elkNodes, hiddenIds, layoutPromise }
  })

  const layouts = await Promise.all(trackData.map((t) => t.layoutPromise))

  // Process each track's layout with progressive X offset
  let currentXOffset = 0

  layouts.forEach((layout, trackIndex) => {
    const { elkNodes, hiddenIds } = trackData[trackIndex] as TrackLayoutData
    const elkNodeById = new Map(elkNodes.map((n) => [n.id, n]))

    // Build map of ELK-computed positions for this track
    const rawPositions = new Map<string, { x: number; y: number }>()
    layout.children?.forEach((node) => {
      if (hiddenIds.has(node.id)) return
      rawPositions.set(node.id, { x: node.x ?? 0, y: node.y ?? 0 })
    })

    // Top-align nodes by layer within this track
    const layerToMinY = new Map<number, number>()
    rawPositions.forEach((pos, nodeId) => {
      const layer = elkNodeById.get(nodeId)?._layer ?? 0
      const currentMin = layerToMinY.get(layer) ?? Infinity
      layerToMinY.set(layer, Math.min(currentMin, pos.y))
    })

    // Apply aligned positions with X offset
    let trackMaxX = 0
    rawPositions.forEach((pos, nodeId) => {
      const layer = elkNodeById.get(nodeId)?._layer ?? 0
      const alignedY = layerToMinY.get(layer) ?? pos.y

      positions.set(nodeId, {
        x: currentXOffset + pos.x,
        y: alignedY,
      })

      const nodeWidth = elkNodeById.get(nodeId)?.width ?? 0
      trackMaxX = Math.max(trackMaxX, pos.x + nodeWidth)
    })

    currentXOffset += trackMaxX + TRACK_GAP
  })

  return positions
}
