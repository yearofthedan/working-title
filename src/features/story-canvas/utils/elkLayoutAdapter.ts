import type { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk-api'
import type {
  CanvasNode,
  Track,
  CanvasEdge,
} from '@/features/story-canvas/composables/useProjectViewModel'

let elkInstance: unknown = null

async function getElk() {
  if (!elkInstance) {
    const ELK = await import('elkjs/lib/elk.bundled.js')
    elkInstance = new ELK.default()
  }
  return elkInstance as import('elkjs/lib/elk-api').ELK
}

const LAYER_SPACING = 50
const TRACK_GAP = 150

const BASE_LAYOUT_OPTIONS = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': '100',
  'elk.layered.spacing.nodeNodeBetweenLayers': '150',
  'elk.separateConnectedComponents': 'false',
  'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
}

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
const getEdgesForTrack = (track: Track, allEdges: CanvasEdge[]): ElkExtendedEdge[] => {
  const nodeIds = new Set(track.nodes.map((n) => n.id))
  return allEdges
    .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
    .map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] }))
}

/**
 * Group root nodes (nodes with no incoming edges) by stage
 */
const getSortedRootGroups = (nodes: CanvasNode[], edges: ElkExtendedEdge[]) => {
  const edgeTargetSet = new Set(edges.flatMap((e) => e.targets))

  return Array.from(
    nodes
      .filter((n) => !edgeTargetSet.has(n.id))
      .reduce((map, { stage = 0, id }) => {
        const group = map.get(stage) ?? []
        group.push(id)
        return map.set(stage, group)
      }, new Map<number, string[]>())
      .entries()
  ).sort((a, b) => a[0] - b[0])
}

/**
 * Creates hidden nodes/edges to force ELK to respect vertical stage gaps
 * and disconnected sub-graphs.
 */
const buildHiddenGraph = (
  nodes: CanvasNode[],
  edges: ElkExtendedEdge[],
  trackIndex: number
): { hiddenNodes: ElkNode[]; hiddenEdges: ElkExtendedEdge[] } => {
  const sortedGroups = getSortedRootGroups(
    nodes.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    edges
  )

  const trackHead = { id: `track-head-${trackIndex}`, width: 0, height: 0 }
  const hiddenNodes: ElkNode[] = [trackHead]
  const hiddenEdges: ElkExtendedEdge[] = []

  let previousAnchorId = trackHead.id

  for (const [stage, rootIds] of sortedGroups) {
    // Create the Anchor Node for this stage
    const anchorNode = {
      id: `anchor-${trackIndex}-${stage}`,
      width: 0,
      height: 0,
    }
    hiddenNodes.push(anchorNode)

    // Connect the previous anchor to the current anchor
    hiddenEdges.push({
      id: `edge-${trackIndex}-${previousAnchorId}-${anchorNode.id}`,
      sources: [previousAnchorId],
      targets: [anchorNode.id],
    })

    // Connect the current anchor to all roots at this stage
    rootIds.forEach((rootId) => {
      hiddenEdges.push({
        id: `attach-${anchorNode.id}-${rootId}`,
        sources: [anchorNode.id],
        targets: [rootId],
      })
    })

    previousAnchorId = anchorNode.id
  }

  return { hiddenNodes, hiddenEdges }
}

const prepareTrackForElk = async (
  track: Track,
  elkEdges: ElkExtendedEdge[],
  trackIndex: number,
  dimensions: Map<string, { w: number; h: number }>
): Promise<ElkNode[]> => {
  const { hiddenNodes, hiddenEdges } = buildHiddenGraph(track.nodes, elkEdges, trackIndex)

  const elkNodes: ElkNode[] = track.nodes
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((n) => ({
      id: n.id,
      width: dimensions.get(n.id)?.w ?? 400,
      height: dimensions.get(n.id)?.h ?? 150,
    }))

  const elk = await getElk()

  const { children } = await elk.layout({
    id: `track-${track.id}`,
    layoutOptions: BASE_LAYOUT_OPTIONS,
    children: [...hiddenNodes, ...elkNodes],
    edges: [...hiddenEdges, ...elkEdges],
  })

  return children ?? []
}

const processTracksWithElk = async (
  tracks: Track[],
  allEdges: CanvasEdge[],
  dimensions: Map<string, { w: number; h: number }>
): Promise<Array<ElkNode[]>> => {
  return Promise.all(
    tracks.map((track, i) => {
      const trackEdges = getEdgesForTrack(track, allEdges)
      return prepareTrackForElk(track, trackEdges, i, dimensions)
    })
  )
}

export const calculateTrackedLayout = async (
  tracks: Track[],
  edges: CanvasEdge[],
  dimensions: Map<string, { w: number; h: number }>
): Promise<Map<string, { x: number; y: number }>> => {
  const processedTracks = await processTracksWithElk(tracks, edges, dimensions)

  return assembleTrackPositions(tracks, processedTracks, dimensions)
}

const assembleTrackPositions = (
  tracks: Track[],
  processedTracks: ElkNode[][],
  dimensions: Map<string, { w: number; h: number }>
): Map<string, { x: number; y: number }> => {
  const positions = new Map<string, { x: number; y: number }>()
  const layerYPositions = calculateLayerYPositions(tracks, dimensions)
  let currentXOffset = 0

  tracks.forEach(({ nodes, offset }, i) => {
    const elkNodeMap = new Map(processedTracks[i]?.map((n) => [n.id, n]) ?? [])
    let maxTrackX = 0

    nodes.forEach((node) => {
      const elkNode = elkNodeMap.get(node.id)
      if (!elkNode) return

      const globalLayer = (node.stage ?? 0) + offset
      const x = currentXOffset + (elkNode.x ?? 0)
      const y = layerYPositions.get(globalLayer) ?? 0

      positions.set(node.id, { x, y })

      maxTrackX = Math.max(maxTrackX, (elkNode.x ?? 0) + (elkNode.width ?? 0))
    })

    if (maxTrackX > 0) {
      currentXOffset += maxTrackX + TRACK_GAP
    }
  })

  return positions
}
