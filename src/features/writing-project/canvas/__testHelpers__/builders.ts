import type { CanvasEdge, BasicCanvasNode, Track, CanvasViewModel } from '../types'

export const buildBasicCanvasNode = (
  overrides: Partial<BasicCanvasNode> = {}
): BasicCanvasNode => ({
  id: 'node-1',
  stepId: 'premise',
  category: 'structure',
  sortOrder: 0,
  ...overrides,
})

export const buildTrack = (overrides: Partial<Track> = {}): Track => ({
  id: 'track-1',
  offset: 0,
  nodes: [buildBasicCanvasNode()],
  ...overrides,
})

export const buildCanvasViewModel = (
  overrides: Partial<CanvasViewModel> = {}
): CanvasViewModel => ({
  tracks: [buildTrack()],
  edges: [buildCanvasEdge()],
  nodeMap: new Map(),
  ...overrides,
})

export const buildCanvasEdge = (overrides: Partial<CanvasEdge> = {}): CanvasEdge => ({
  id: 'edge-1',
  source: 'node-1',
  target: 'node-2',
  ...overrides,
})
