import ELK from 'elkjs/lib/elk.bundled.js'
import type { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk-api'
import type {
  TracksViewModel,
  Track,
  CanvasEdge,
} from '@/features/story-canvas/composables/useProjectViewModel'

const elk = new ELK()

const LAYER_SPACING = 50
const TRACK_GAP = 150
const HIDDEN_ROOT_PREFIX = '__hidden_root_track_'

const BASE_LAYOUT_OPTIONS = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': '100',
  'elk.layered.spacing.nodeNodeBetweenLayers': '150',
}

interface ElkNodeWithLayerData extends ElkNode {
  layer: number
}

type ElkEdgeInput = ElkExtendedEdge

interface ElkLayoutResult {
  children?: ElkNodeWithLayerData[]
}

// --- HELPERS ---

/**
 * Calculates max height for each stage across ALL tracks to ensure
 * vertical alignment.
 */
const calculateLayerYPositions = (
  tracks: Track[],
  dimensions: Map<string, { w: number; h: number }>
): Map<number, number> => {
  const layerHeights = new Map<number, number>()
  const layerYPositions = new Map<number, number>()

  tracks
    .flatMap((t) => t.nodes.map((n) => ({ ...n, trackOffset: t.offset })))
    .forEach((node) => {
      const globalLayer = (node.stage ?? 0) + node.trackOffset
      const h = dimensions.get(node.id)?.h ?? 150
      layerHeights.set(globalLayer, Math.max(layerHeights.get(globalLayer) ?? 0, h))
    })

  const sortedLayers = Array.from(layerHeights.keys()).sort((a, b) => a - b)
  let currentY = 0
  sortedLayers.forEach((layer) => {
    layerYPositions.set(layer, currentY)
    currentY += (layerHeights.get(layer) ?? 0) + LAYER_SPACING
  })

  return layerYPositions
}

/**
 * Extracts edges where both source and target exist within the same track.
 */
const getEdgesForTrack = (track: Track, allEdges: CanvasEdge[]): ElkEdgeInput[] => {
  const nodeIds = new Set(track.nodes.map((n) => n.id))
  return allEdges
    .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
    .map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] }))
}

/**
 * Creates hidden nodes/edges to force ELK to respect vertical stage gaps
 * for disconnected sub-graphs.
 */
const buildHiddenGraph = (
  elkNodes: ElkNodeWithLayerData[],
  edges: ElkEdgeInput[],
  trackIndex: number
): { hiddenNodes: ElkNodeWithLayerData[]; hiddenEdges: ElkEdgeInput[] } => {
  const hiddenRootId = `${HIDDEN_ROOT_PREFIX}${trackIndex}`
  const hasIncomingEdge = new Set(edges.map((e) => e.targets[0]))
  const rootNodeIds = new Set(elkNodes.filter((n) => !hasIncomingEdge.has(n.id)).map((n) => n.id))

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

const prepareTrackForElk = async (
  trackId: string,
  elkNodes: ElkNodeWithLayerData[],
  elkEdges: ElkEdgeInput[],
  trackIndex: number
): Promise<ElkLayoutResult> => {
  const { hiddenNodes, hiddenEdges } = buildHiddenGraph(elkNodes, elkEdges, trackIndex)
  const hiddenIds = new Set(hiddenNodes.map((n) => n.id))

  const layout: ElkLayoutResult = await elk.layout({
    id: `track-${trackId}`,
    layoutOptions: {
      ...BASE_LAYOUT_OPTIONS,
      'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
    },
    children: [...hiddenNodes, ...elkNodes],
    edges: [...hiddenEdges, ...elkEdges],
  })

  return {
    ...layout,
    children: layout.children
      ?.filter((node) => !hiddenIds.has(node.id))
      .map((node) => ({
        ...node,
        layer: elkNodes.find((en) => en.id === node.id)?.layer ?? 0,
      })),
  }
}

const layoutSingleTrack = async (
  track: Track,
  allEdges: CanvasEdge[],
  dimensions: Map<string, { w: number; h: number }>,
  index: number
): Promise<ElkLayoutResult> => {
  const elkNodes: ElkNodeWithLayerData[] = [...track.nodes]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((n) => ({
      id: n.id,
      width: dimensions.get(n.id)?.w ?? 400,
      height: dimensions.get(n.id)?.h ?? 150,
      layer: n.stage ?? 0,
    }))

  const trackEdges = getEdgesForTrack(track, allEdges)
  return await prepareTrackForElk(track.id, elkNodes, trackEdges, index)
}

export const runProcessLayout = async (
  graphData: TracksViewModel,
  dimensions: Map<string, { w: number; h: number }>
): Promise<Map<string, { x: number; y: number }>> => {
  const positions = new Map<string, { x: number; y: number }>()

  const layerYPositions = calculateLayerYPositions(graphData.tracks, dimensions)

  let currentXOffset = 0

  for (const [i, track] of graphData.tracks.entries()) {
    const result = await layoutSingleTrack(track, graphData.edges, dimensions, i)

    let maxTrackWidth = 0
    result.children?.forEach((elkNode) => {
      const node = track.nodes.find((n) => n.id === elkNode.id)
      if (!node) return

      const globalLayer = (node.stage ?? 0) + track.offset

      positions.set(elkNode.id, {
        x: currentXOffset + (elkNode.x ?? 0),
        y: layerYPositions.get(globalLayer) ?? 0,
      })

      maxTrackWidth = Math.max(maxTrackWidth, (elkNode.x ?? 0) + (elkNode.width ?? 0))
    })

    currentXOffset += maxTrackWidth + TRACK_GAP
  }

  return positions
}
