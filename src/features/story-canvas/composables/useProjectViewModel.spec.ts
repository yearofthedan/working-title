import { describe, it, expect } from 'vitest'
import {
  createProjectData,
  createStep,
  createProcessTemplate,
  createStepDefinition,
  createTrackDefinition,
} from '../../../specs/__testHelpers__/builders'
import { useProjectViewModel } from '@/features/story-canvas/composables/useProjectViewModel'
import { ref } from 'vue'

describe('useProjectViewModel', () => {
  it('maps nodes to correct targets (canvas, sidebar, both)', () => {
    const project = ref(
      createProjectData({
        steps: [
          createStep({ id: 'step-1', stepId: 'canvas-only-step' }),
          createStep({ id: 'step-2', stepId: 'sidebar-only-step' }),
          createStep({ id: 'step-3', stepId: 'both-step' }),
        ],
      })
    )
    const template = ref(
      createProcessTemplate({
        stepDefinitions: [
          createStepDefinition({ id: 'canvas-only-step', ui: { visibility: ['canvas'] } }),
          createStepDefinition({ id: 'sidebar-only-step', ui: { visibility: ['sidebar'] } }),
          createStepDefinition({ id: 'both-step', ui: { visibility: ['canvas', 'sidebar'] } }),
        ],
      })
    )

    const { viewModel } = useProjectViewModel(project, template, ref({}))

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
      it('maps step content, category, and stage correctly', async () => {
        const project = ref(
          createProjectData({
            steps: [createStep({ id: 's1', stepId: 'p1', content: { text: 'Hello' } })],
          })
        )
        const template = ref(
          createProcessTemplate({
            stepDefinitions: [
              createStepDefinition({
                id: 'p1',
                category: 'structure',
                stage: 5,
                editorConfig: { format: 'plain', placeholderText: 'placeholder' },
                ui: { visibility: ['canvas'] },
              }),
            ],
          })
        )

        const { viewModel } = useProjectViewModel(project, template, ref({}))
        const node = viewModel.value.tracks.tracks[0]!.nodes[0]!

        expect(node.content).toBe('Hello')
        expect(node.stage).toBe(5)
        expect(node.category).toBe('structure')
      })

      it('maps step format "plain" to node type "plainText"', async () => {
        const project = ref(
          createProjectData({
            steps: [createStep({ id: 'step-1', stepId: 'plain-step' })],
          })
        )
        const template = ref(
          createProcessTemplate({
            stepDefinitions: [
              createStepDefinition({
                id: 'plain-step',
                ui: { visibility: ['canvas'] },
                editorConfig: { format: 'plain', placeholderText: 'placeholder' },
              }),
            ],
          })
        )

        const { viewModel } = useProjectViewModel(project, template, ref({}))
        expect(viewModel.value.tracks.tracks[0]!.nodes[0]!.type).toBe('plainText')
      })

      it('maps step format "rich" to node type "richText"', async () => {
        const project = ref(
          createProjectData({
            steps: [createStep({ id: 'step-1', stepId: 'rich-step' })],
          })
        )
        const template = ref(
          createProcessTemplate({
            stepDefinitions: [
              createStepDefinition({
                id: 'rich-step',
                ui: { visibility: ['canvas'] },
                editorConfig: { format: 'rich', placeholderText: 'placeholder' },
              }),
            ],
          })
        )

        const { viewModel } = useProjectViewModel(project, template, ref({}))
        expect(viewModel.value.tracks.tracks[0]!.nodes[0]!.type).toBe('richText')
      })

      it('maps the label from strings via labelText key', async () => {
        const project = ref(
          createProjectData({
            steps: [createStep({ id: 'step-1', stepId: 'premise' })],
          })
        )
        const template = ref(
          createProcessTemplate({
            stepDefinitions: [
              createStepDefinition({
                id: 'premise',
                labelText: 'step.premise.label',
                ui: { visibility: ['canvas'] },
              }),
            ],
          })
        )

        const strings = ref({ step: { premise: { label: 'My Custom Label' } } })
        const { viewModel } = useProjectViewModel(project, template, strings)

        expect(viewModel.value.tracks.tracks[0]!.nodes[0]!.label).toBe('My Custom Label')
      })

      it('falls back to the labelText key when strings are missing', async () => {
        const project = ref(
          createProjectData({
            steps: [createStep({ id: 'step-1', stepId: 'premise' })],
          })
        )
        const template = ref(
          createProcessTemplate({
            stepDefinitions: [
              createStepDefinition({
                id: 'premise',
                labelText: 'step.missing.label',
                ui: { visibility: ['canvas'] },
              }),
            ],
          })
        )
        const strings = ref({})

        const { viewModel } = useProjectViewModel(project, template, strings)
        expect(viewModel.value.tracks.tracks[0]!.nodes[0]!.label).toBe('step.missing.label')
      })
    })

    it('assigns sortOrder based on the step definition sequence in the template', () => {
      const project = ref(
        createProjectData({
          steps: [
            createStep({ id: 'step-B', stepId: 'def-2' }),
            createStep({ id: 'step-A', stepId: 'def-1' }),
          ],
        })
      )

      const template = ref(
        createProcessTemplate({
          stepDefinitions: [
            createStepDefinition({ id: 'def-1', ui: { visibility: ['canvas'] } }),
            createStepDefinition({ id: 'def-2', ui: { visibility: ['canvas'] } }),
          ],
        })
      )

      const { viewModel } = useProjectViewModel(project, template, ref({}))
      const nodes = viewModel.value.tracks.tracks[0]!.nodes

      expect(nodes[0]!.id).toBe('step-A')
      expect(nodes[1]!.id).toBe('step-B')
      expect(nodes[0]!.sortOrder).toBeLessThan(nodes[1]!.sortOrder)
    })

    it('creates separate tracks for different root types defined for the same track defn', () => {
      const project = ref(
        createProjectData({
          steps: [
            createStep({ id: 'winston-summary', stepId: 'char-summary' }),
            createStep({ id: 'winston-detail', stepId: 'char-detail' }),
            createStep({ id: 'julia-backstory', stepId: 'char-backstory' }),
            createStep({ id: 'julia-detail', stepId: 'char-detail' }),
          ],
          connections: [
            { id: 'e1', source: 'winston-summary', target: 'winston-detail' },
            { id: 'e2', source: 'julia-backstory', target: 'julia-detail' },
          ],
        })
      )
      const template = ref(
        createProcessTemplate({
          stepDefinitions: [
            createStepDefinition({ id: 'char-summary', ui: { visibility: ['canvas'] } }),
            createStepDefinition({ id: 'char-backstory', ui: { visibility: ['canvas'] } }),
            createStepDefinition({ id: 'char-detail', ui: { visibility: ['canvas'] } }),
          ],
          ui: {
            tracks: [
              createTrackDefinition({
                id: 'characters',
                rootStepIds: ['char-summary', 'char-backstory'],
              }),
            ],
          },
        })
      )

      const { viewModel } = useProjectViewModel(project, template, ref({}))
      const charTracks = viewModel.value.tracks.tracks.filter((t) => t.id.startsWith('characters'))

      expect(charTracks).toHaveLength(2)
      // Check Winston's track content
      const winstonTrack = charTracks.find((t) => t.nodes.some((n) => n.id === 'winston-summary'))
      expect(winstonTrack?.nodes.map((n) => n.id)).toEqual(['winston-summary', 'winston-detail'])
    })

    it('creates separate tracks with layerOffsets from the track defn', () => {
      const project = ref(
        createProjectData({
          steps: [
            createStep({ id: 'plot-1', stepId: 'plot-point' }),
            createStep({ id: 'winston-1', stepId: 'char-summary' }),
          ],
        })
      )
      const template = ref(
        createProcessTemplate({
          stepDefinitions: [
            createStepDefinition({ id: 'plot-point', ui: { visibility: ['canvas'] } }),
            createStepDefinition({ id: 'char-summary', ui: { visibility: ['canvas'] } }),
          ],
          ui: {
            tracks: [
              createTrackDefinition({ id: 'main', rootStepIds: ['plot-point'], layerOffset: 0 }),
              createTrackDefinition({
                id: 'characters',
                rootStepIds: ['char-summary'],
                layerOffset: 2,
              }),
            ],
          },
        })
      )

      const { viewModel } = useProjectViewModel(project, template, ref({}))
      const mainTrack = viewModel.value.tracks.tracks.find((t) => t.id.startsWith('main'))
      const charTrack = viewModel.value.tracks.tracks.find((t) => t.id.startsWith('characters'))

      expect(mainTrack?.offset).toBe(0)
      expect(charTrack?.offset).toBe(2)
    })

    it('places steps that are not reachable from any root into an orphans track', () => {
      const project = ref(
        createProjectData({
          steps: [
            createStep({ id: 'root-node', stepId: 'main-step' }),
            createStep({ id: 'lonely-node', stepId: 'other-step' }),
          ],
        })
      )
      const template = ref(
        createProcessTemplate({
          stepDefinitions: [
            createStepDefinition({ id: 'main-step', ui: { visibility: ['canvas'] } }),
            createStepDefinition({ id: 'other-step', ui: { visibility: ['canvas'] } }),
          ],
          ui: { tracks: [createTrackDefinition({ id: 'main', rootStepIds: ['main-step'] })] },
        })
      )

      const { viewModel } = useProjectViewModel(project, template, ref({}))
      const orphanTrack = viewModel.value.tracks.tracks.find((t) => t.id === '__orphans')
      expect(orphanTrack).toBeDefined()
      expect(orphanTrack?.nodes.map((n) => n.id)).toContain('lonely-node')
    })
  })
})
