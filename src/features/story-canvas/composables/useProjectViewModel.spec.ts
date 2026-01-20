import { describe, it, expect } from 'vitest'
import { buildProjectData, buildStep } from '@/features/story/__testHelpers__/builders'
import { useProjectViewModel } from '@/features/story-canvas/composables/useProjectViewModel'
import { ref } from 'vue'
import {
  buildProcessTemplate,
  buildStepDefinition,
  buildTrackDefinition,
} from '@/features/process-templates/__testHelpers__/builders'

describe('useProjectViewModel', () => {
  it('maps nodes to correct targets (canvas, sidebar, both)', () => {
    const project = ref(
      buildProjectData({
        steps: [
          buildStep({ id: 'step-1', stepId: 'canvas-only-step' }),
          buildStep({ id: 'step-2', stepId: 'sidebar-only-step' }),
          buildStep({ id: 'step-3', stepId: 'both-step' }),
        ],
      })
    )
    const template = ref(
      buildProcessTemplate({
        stepDefinitions: [
          buildStepDefinition({ id: 'canvas-only-step', ui: { visibility: ['canvas'] } }),
          buildStepDefinition({ id: 'sidebar-only-step', ui: { visibility: ['sidebar'] } }),
          buildStepDefinition({ id: 'both-step', ui: { visibility: ['canvas', 'sidebar'] } }),
        ],
      })
    )

    const { viewModel } = useProjectViewModel(project, template)

    // Flatten tracks to check total canvas nodes
    const canvasNodes = viewModel.value.tracks.tracks.flatMap((t) => t.nodes)

    expect(canvasNodes).toHaveLength(2)
    expect(canvasNodes.map((n) => n.id)).toContain('step-1')
    expect(canvasNodes.map((n) => n.id)).toContain('step-3')

    expect(viewModel.value.sidebar.nodes).toHaveLength(2)
    expect(viewModel.value.sidebar.nodes.map((n) => n.id)).toEqual(['step-2', 'step-3'])
  })

  describe('tracks', () => {
    describe('node mapping', () => {
      it('maps step category and stage correctly', async () => {
        const project = ref(
          buildProjectData({
            steps: [buildStep({ id: 's1', stepId: 'p1' })],
          })
        )
        const template = ref(
          buildProcessTemplate({
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
        )

        const { viewModel } = useProjectViewModel(project, template)
        const node = viewModel.value.tracks.tracks[0]!.nodes[0]!

        expect(node.stage).toBe(5)
        expect(node.category).toBe('structure')
      })
    })

    it('assigns sortOrder based on the step definition sequence in the template', () => {
      const project = ref(
        buildProjectData({
          steps: [
            buildStep({ id: 'step-B', stepId: 'def-2' }),
            buildStep({ id: 'step-A', stepId: 'def-1' }),
          ],
        })
      )

      const template = ref(
        buildProcessTemplate({
          stepDefinitions: [
            buildStepDefinition({ id: 'def-1', ui: { visibility: ['canvas'] } }),
            buildStepDefinition({ id: 'def-2', ui: { visibility: ['canvas'] } }),
          ],
        })
      )

      const { viewModel } = useProjectViewModel(project, template)
      const nodes = viewModel.value.tracks.tracks[0]!.nodes

      expect(nodes[0]!.id).toBe('step-A')
      expect(nodes[1]!.id).toBe('step-B')
      expect(nodes[0]!.sortOrder).toBeLessThan(nodes[1]!.sortOrder)
    })

    it('creates separate tracks for different root types defined for the same track defn', () => {
      const project = ref(
        buildProjectData({
          steps: [
            buildStep({ id: 'winston-summary', stepId: 'char-summary' }),
            buildStep({ id: 'winston-detail', stepId: 'char-detail' }),
            buildStep({ id: 'julia-backstory', stepId: 'char-backstory' }),
            buildStep({ id: 'julia-detail', stepId: 'char-detail' }),
          ],
          connections: [
            { id: 'e1', source: 'winston-summary', target: 'winston-detail' },
            { id: 'e2', source: 'julia-backstory', target: 'julia-detail' },
          ],
        })
      )
      const template = ref(
        buildProcessTemplate({
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
      )

      const { viewModel } = useProjectViewModel(project, template)
      const charTracks = viewModel.value.tracks.tracks.filter((t) => t.id.startsWith('characters'))

      expect(charTracks).toHaveLength(2)
      // Check Winston's track content
      const winstonTrack = charTracks.find((t) => t.nodes.some((n) => n.id === 'winston-summary'))
      expect(winstonTrack?.nodes.map((n) => n.id)).toEqual(['winston-summary', 'winston-detail'])
    })

    it('creates separate tracks with layerOffsets from the track defn', () => {
      const project = ref(
        buildProjectData({
          steps: [
            buildStep({ id: 'plot-1', stepId: 'plot-point' }),
            buildStep({ id: 'winston-1', stepId: 'char-summary' }),
          ],
        })
      )
      const template = ref(
        buildProcessTemplate({
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
      )

      const { viewModel } = useProjectViewModel(project, template)
      const mainTrack = viewModel.value.tracks.tracks.find((t) => t.id.startsWith('main'))
      const charTrack = viewModel.value.tracks.tracks.find((t) => t.id.startsWith('characters'))

      expect(mainTrack?.offset).toBe(0)
      expect(charTrack?.offset).toBe(2)
    })

    it('places steps that are not reachable from any root into an orphans track', () => {
      const project = ref(
        buildProjectData({
          steps: [
            buildStep({ id: 'root-node', stepId: 'main-step' }),
            buildStep({ id: 'lonely-node', stepId: 'other-step' }),
          ],
        })
      )
      const template = ref(
        buildProcessTemplate({
          stepDefinitions: [
            buildStepDefinition({ id: 'main-step', ui: { visibility: ['canvas'] } }),
            buildStepDefinition({ id: 'other-step', ui: { visibility: ['canvas'] } }),
          ],
          ui: { tracks: [buildTrackDefinition({ id: 'main', rootStepIds: ['main-step'] })] },
        })
      )

      const { viewModel } = useProjectViewModel(project, template)
      const orphanTrack = viewModel.value.tracks.tracks.find((t) => t.id === '__orphans')
      expect(orphanTrack).toBeDefined()
      expect(orphanTrack?.nodes.map((n) => n.id)).toContain('lonely-node')
    })
  })
})
