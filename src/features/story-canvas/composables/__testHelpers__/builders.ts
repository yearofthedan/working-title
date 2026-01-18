import type {
  CanvasEdge,
  CanvasNode,
  Track,
  TracksViewModel,
} from '@/features/story-canvas/composables/useProjectViewModel'

export const createCanvasNode = (overrides: Partial<CanvasNode> = {}): CanvasNode => ({
  id: 'node-1',
  stepId: 'premise',
  type: 'richText',
  category: 'structure',
  label: 'Test label',
  sortOrder: 0,
  ...overrides,
})

export const createTrack = (overrides: Partial<Track> = {}): Track => ({
  id: 'track-1',
  offset: 0,
  nodes: [createCanvasNode()],
  ...overrides,
})

export const createTracksViewModel = (
  overrides: Partial<TracksViewModel> = {}
): TracksViewModel => ({
  tracks: [createTrack()],
  edges: [createCanvasEdge()],
  sortingConfig: {
    stepOrder: [],
  },
  ...overrides,
})

export const createCanvasEdge = (overrides: Partial<CanvasEdge> = {}): CanvasEdge => ({
  id: 'edge-1',
  source: 'node-1',
  target: 'node-2',
  ...overrides,
})
