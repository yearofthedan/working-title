import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { buildStep, buildProjectData, buildInMemoryProjectStore } from '@/features/project-storage/__testHelpers__/builders'
import {
  buildProcessTemplate,
  buildStepDefinition,
  buildTrackDefinition,
} from '@/features/process-templates/__testHelpers__/builders'
import { useCanvasViewModel } from './useCanvasViewModel'
import {
  DEFINITIONS_CONTEXT_KEY,
  definitionsContext,
} from '@/features/writing-project/composables/useDefinitionsContext'
import type { Connection, Step } from '@/features/project-storage/types'
import { runWithComponent } from '@/__testHelpers__/renderer'
import {
  ACTIVE_PROJECT_CONTEXT_KEY,
  activeProjectContext,
} from '@/features/writing-project/composables/useActiveProjectContext'
import type { ProcessTemplate } from '@/features/process-templates/processTemplate'
import { buildProviders } from '@/__testHelpers__/builders'

describe('useCanvasViewModel', () => {

  function renderCanvas(params: {
    steps?: Step[]
    connections?: Connection[]
    template: ProcessTemplate
  }) {
    const steps = ref(params.steps || [])
    const connections = ref(params.connections || [])
    const template = ref(params.template)

    return runWithComponent(
      () =>
        useCanvasViewModel(
          steps,
          connections,
          template,
          vi.fn(() => [])
        ),
      {
        global: {
          provide: buildProviders({
            [DEFINITIONS_CONTEXT_KEY]: definitionsContext(template),
            [ACTIVE_PROJECT_CONTEXT_KEY]: activeProjectContext(
              ref(buildProjectData({ steps: steps.value, connections: connections.value })),
              buildInMemoryProjectStore()
            ),
          }),
        },
      }
    )
  }

  it('maps step category and stage correctly', async () => {
    const steps = [buildStep({ id: 's1', stepId: 'p1' })]
    const template = buildProcessTemplate({
      stepDefinitions: [
        buildStepDefinition({
          id: 'p1',
          category: 'structure',
          stage: 5,
          editorConfig: { format: 'plain', placeholderText: 'placeholder' },
          ui: { visibility: ['canvas'] },
        }),
      ],
    })

    const viewModel = renderCanvas({ steps, connections: [], template })

    const node = viewModel.value.tracks[0]!.nodes[0]!
    expect(node.stage).toBe(5)
    expect(node.category).toBe('structure')
  })

  it('assigns sortOrder based on the step definition sequence in the template', () => {
    const steps = [
      buildStep({ id: 'step-B', stepId: 'def-2' }),
      buildStep({ id: 'step-A', stepId: 'def-1' }),
    ]
    const template = buildProcessTemplate({
      stepDefinitions: [
        buildStepDefinition({ id: 'def-1', ui: { visibility: ['canvas'] } }),
        buildStepDefinition({ id: 'def-2', ui: { visibility: ['canvas'] } }),
      ],
    })

    const viewModel = renderCanvas({ steps, connections: [], template })
    const nodes = viewModel.value.tracks[0]!.nodes
    expect(nodes[0]!.id).toBe('step-A')
    expect(nodes[1]!.id).toBe('step-B')
    expect(nodes[0]!.sortOrder).toBeLessThan(nodes[1]!.sortOrder)
  })

  it('creates separate tracks for different root types defined for the same track defn', () => {
    const steps = [
      buildStep({ id: 'winston-summary', stepId: 'char-summary' }),
      buildStep({ id: 'winston-detail', stepId: 'char-detail' }),
      buildStep({ id: 'julia-backstory', stepId: 'char-backstory' }),
      buildStep({ id: 'julia-detail', stepId: 'char-detail' }),
    ]
    const connections = [
      { id: 'e1', source: 'winston-summary', target: 'winston-detail' },
      { id: 'e2', source: 'julia-backstory', target: 'julia-detail' },
    ]
    const template = buildProcessTemplate({
      stepDefinitions: [
        buildStepDefinition({ id: 'char-summary', ui: { visibility: ['canvas'] } }),
        buildStepDefinition({ id: 'char-backstory', ui: { visibility: ['canvas'] } }),
        buildStepDefinition({ id: 'char-detail', ui: { visibility: ['canvas'] } }),
      ],
      ui: {
        tracks: [
          buildTrackDefinition({
            id: 'characters',
            rootStepIds: ['char-summary', 'char-backstory'],
          }),
        ],
      },
    })

    const viewModel = renderCanvas({ steps, connections, template })

    const charTracks = viewModel.value.tracks.filter((t) => t.id.startsWith('characters'))
    expect(charTracks).toHaveLength(2)
    const winstonTrack = charTracks.find((t) => t.nodes.some((n) => n.id === 'winston-summary'))
    expect(winstonTrack?.nodes.map((n) => n.id)).toEqual(['winston-summary', 'winston-detail'])
  })

  it('creates separate tracks with layerOffsets from the track defn', () => {
    const steps = [
      buildStep({ id: 'plot-1', stepId: 'plot-point' }),
      buildStep({ id: 'winston-1', stepId: 'char-summary' }),
    ]
    const template = buildProcessTemplate({
      stepDefinitions: [
        buildStepDefinition({ id: 'plot-point', ui: { visibility: ['canvas'] } }),
        buildStepDefinition({ id: 'char-summary', ui: { visibility: ['canvas'] } }),
      ],
      ui: {
        tracks: [
          buildTrackDefinition({ id: 'main', rootStepIds: ['plot-point'], layerOffset: 0 }),
          buildTrackDefinition({
            id: 'characters',
            rootStepIds: ['char-summary'],
            layerOffset: 2,
          }),
        ],
      },
    })

    const viewModel = renderCanvas({ steps, connections: [], template })

    const mainTrack = viewModel.value.tracks.find((t) => t.id.startsWith('main'))
    const charTrack = viewModel.value.tracks.find((t) => t.id.startsWith('characters'))
    expect(mainTrack?.offset).toBe(0)
    expect(charTrack?.offset).toBe(2)
  })

  it('places steps that are not reachable from any root into an orphans track', () => {
    const steps = [
      buildStep({ id: 'root-node', stepId: 'main-step' }),
      buildStep({ id: 'lonely-node', stepId: 'other-step' }),
    ]
    const template = buildProcessTemplate({
      stepDefinitions: [
        buildStepDefinition({ id: 'main-step', ui: { visibility: ['canvas'] } }),
        buildStepDefinition({ id: 'other-step', ui: { visibility: ['canvas'] } }),
      ],
      ui: { tracks: [buildTrackDefinition({ id: 'main', rootStepIds: ['main-step'] })] },
    })

    const viewModel = renderCanvas({ steps, connections: [], template })

    const orphanTrack = viewModel.value.tracks.find((t) => t.id === '__orphans')
    expect(orphanTrack).toBeDefined()
    expect(orphanTrack?.nodes.map((n) => n.id)).toContain('lonely-node')
  })
})
