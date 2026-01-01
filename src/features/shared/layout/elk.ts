import ELK from 'elkjs/lib/elk.bundled.js'
import type { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk-api'
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
  /** Extract layer for vertical positioning */
  layerSelector: (node: T) => number
  /** Comparator for horizontal ordering within a layer */
  nodeComparator: (a: T, b: T) => number
}

interface ElkNodeWithLayerData extends ElkNode {
  // Metadata for post-layout processing
  layer: number
}

type ElkEdgeInput = ElkExtendedEdge

interface ElkLayoutResult {
  children?: ElkNodeWithLayerData[]
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
  elkNodes: ElkNodeWithLayerData[],
  edges: ElkEdgeInput[],
  trackIndex: number
): { hiddenNodes: ElkNodeWithLayerData[]; hiddenEdges: ElkEdgeInput[] } => {
  const hiddenRootId = `${HIDDEN_ROOT_PREFIX}${trackIndex}`
  const hasIncomingEdge = new Set(edges.map((e) => e.targets[0]))
  const rootNodeIds = new Set(elkNodes.filter((n) => !hasIncomingEdge.has(n.id)).map((n) => n.id))

  // Group roots by layer
  const layerToRoots = new Map<number, string[]>()
  elkNodes.forEach((node) => {
    if (!rootNodeIds.has(node.id)) return
    const layer = node.layer
    const existing = layerToRoots.get(layer) ?? []
    existing.push(node.id)
    layerToRoots.set(layer, existing)
  })

  const hiddenRootNode: ElkNodeWithLayerData = { id: hiddenRootId, width: 0, height: 0, layer: 0 }
  const hiddenNodes: ElkNodeWithLayerData[] = [hiddenRootNode]
  const hiddenEdges: ElkEdgeInput[] = []

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
      hiddenNodes.push({ id: bridgeId, width: 0, height: 0, layer })

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

const LAYER_SPACING = 150

/**
 * Calculate global Y position for each layer based on max node heights.
 */
const calculateLayerYPositions = (elkLayouts: ElkLayoutResult[]): Map<number, number> => {
  const nodeData = extractLayerHeights(elkLayouts)

  const layerMaxHeight = new Map<number, number>()
  nodeData.forEach(({ layer, height }) => {
    const current = layerMaxHeight.get(layer) ?? 0
    layerMaxHeight.set(layer, Math.max(current, height))
  })

  const sortedLayers = Array.from(layerMaxHeight.keys()).sort((a, b) => a - b)
  const layerToY = new Map<number, number>()
  let cumulativeY = 0

  sortedLayers.forEach((layer) => {
    layerToY.set(layer, cumulativeY)
    cumulativeY += (layerMaxHeight.get(layer) ?? 0) + LAYER_SPACING
  })

  return layerToY
}

/**
 * Prepare a single track for ELK layout and run it
 */
const prepareTrackForElk = async <T extends LayoutNode>(
  track: LayoutTrack<T>,
  trackIndex: number,
  layerSelector: (node: T) => number,
  nodeComparator: (a: T, b: T) => number
): Promise<ElkLayoutResult> => {
  // Calculate layers for all nodes (our positioning logic)
  const nodeLayers = new Map(track.nodes.map((node) => [node.id, layerSelector(node)] as const))

  const elkNodes: ElkNodeWithLayerData[] = track.nodes.map((node) => ({
    id: node.id,
    width: node.width,
    height: node.height,
    layer: nodeLayers.get(node.id) ?? 0,
  }))

  const elkEdges: ElkEdgeInput[] = track.edges.map((edge) => ({
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

  const layout: ElkLayoutResult = await elk.layout({
    id: `track-${track.trackName}`,
    layoutOptions: {
      ...BASE_LAYOUT_OPTIONS,
      'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
    },
    children: [...hiddenNodes, ...elkNodes],
    edges: [...hiddenEdges, ...elkEdges],
  })

  const enrichedLayout = {
    ...layout,
    children: layout.children
      // Remove the hidden nodes now that they've served their purpose of being used to drive coordinates
      ?.filter((node) => !hiddenIds.has(node.id))
      .map((node) => ({
        ...node,
        // Re-add the layer data
        layer: nodeLayers.get(node.id) ?? 0,
      })),
  }

  return enrichedLayout
}

/**
 * Derive layer heights from the ELK results
 */
const extractLayerHeights = (
  elkLayouts: ElkLayoutResult[]
): Array<{ layer: number; height: number }> => {
  return elkLayouts.flatMap((layout) =>
    (layout.children ?? []).map((node) => ({
      layer: node.layer,
      height: node.height ?? 0,
    }))
  )
}

/**
 * Apply final positioning: global Y alignment and progressive X offsets
 */
const applyFinalPositioning = (
  elkLayouts: ElkLayoutResult[],
  layerToGlobalY: Map<number, number>
): Map<string, { x: number; y: number }> => {
  const positions = new Map<string, { x: number; y: number }>()
  let currentXOffset = 0

  elkLayouts.forEach((elkLayout) => {
    const nodes = elkLayout.children ?? []

    let trackMaxX = 0

    nodes.forEach((node) => {
      const globalY = layerToGlobalY.get(node.layer) ?? 0

      positions.set(node.id, {
        x: currentXOffset + (node.x ?? 0),
        y: globalY,
      })

      trackMaxX = Math.max(trackMaxX, (node.x ?? 0) + (node.width ?? 0))
    })

    currentXOffset += trackMaxX + TRACK_GAP
  })

  return positions
}

/**
 * Run ELK layout for multiple tracks, returning positions.
 * ELK handles X positioning; we compute global Y positions based on layers.
 */
export const runLayout = async <T extends LayoutNode>(
  tracks: LayoutTrack<T>[],
  options: LayoutOptions<T>
): Promise<Map<string, { x: number; y: number }>> => {
  const { layerSelector, nodeComparator } = options

  // Prepare and run ELK layouts for all tracks in parallel
  const elkLayouts = await Promise.all(
    tracks.map((track, i) => prepareTrackForElk(track, i, layerSelector, nodeComparator))
  )

  // Calculate global Y positions and apply final positioning
  const layerToGlobalY = calculateLayerYPositions(elkLayouts)
  const positions = applyFinalPositioning(elkLayouts, layerToGlobalY)

  return positions
}
