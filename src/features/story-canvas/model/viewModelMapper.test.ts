import { describe, it, expect } from 'vitest'
import { mapProjectToViewModel } from './viewModelMapper'
import {
  createProjectData,
  createStep,
  createProcessTemplate,
  createStepDefinition,
} from '../../shared/__testHelpers__/builders'

describe('mapProjectToViewModel', () => {
  describe('canvas nodes', () => {
    describe('data mapping', () => {
      it('maps nodes to correct targets (canvas, sidebar, both) and ignores those with no target', async () => {
        const project = createProjectData({
          steps: [
            createStep({ id: 'step-1', stepId: 'canvas-only-step' }),
            createStep({ id: 'step-2', stepId: 'sidebar-only-step' }),
            createStep({ id: 'step-3', stepId: 'both-step' }),
          ],
        })
        const template = createProcessTemplate({
          stepDefinitions: [
            createStepDefinition({ id: 'canvas-only-step', ui: { visibility: ['canvas'] } }),
            createStepDefinition({ id: 'sidebar-only-step', ui: { visibility: ['sidebar'] } }),
            createStepDefinition({ id: 'both-step', ui: { visibility: ['canvas', 'sidebar'] } }),
            createStepDefinition({ id: 'unknown-step', ui: { visibility: [] } }),
          ],
        })

        const result = await mapProjectToViewModel(project, template, {})

        expect(result.canvas.nodes).toHaveLength(2)
        expect(result.canvas.nodes.map((n) => n.id)).toEqual(['step-1', 'step-3'])
        expect(result.sidebar.nodes).toHaveLength(2)
        expect(result.sidebar.nodes.map((n) => n.id)).toEqual(['step-2', 'step-3'])
      })

      it('maps step content to node data', async () => {
        const project = createProjectData({
          steps: [
            createStep({
              id: 'step-1',
              stepId: 'premise',
              content: { text: 'This is my story premise content' },
            }),
          ],
        })
        const template = createProcessTemplate({
          stepDefinitions: [createStepDefinition({ id: 'premise' })],
        })
        const strings = { step: { premise: { label: 'Premise' } } }

        const result = await mapProjectToViewModel(project, template, strings)

        expect(result.canvas.nodes[0]?.data?.content).toEqual('This is my story premise content')
      })

      it('maps step format "plain" to node type "plainText"', async () => {
        const project = createProjectData({
          steps: [createStep({ id: 'step-1', stepId: 'plain-step' })],
        })
        const template = createProcessTemplate({
          stepDefinitions: [
            createStepDefinition({
              id: 'plain-step',
              editorConfig: { format: 'plain', placeholderText: 'step.plain.placeholder' },
            }),
          ],
        })
        const strings = { step: { 'plain-step': { label: 'Plain Step' } } }

        const result = await mapProjectToViewModel(project, template, strings)

        expect(result.canvas.nodes[0]?.type).toBe('plainText')
      })

      it('maps step format "rich" to node type "richText"', async () => {
        const project = createProjectData({
          steps: [
            createStep({
              id: 'step-1',
              stepId: 'rich-step',
              content: { text: '<p>Rich text content</p>' },
            }),
          ],
        })
        const template = createProcessTemplate({
          stepDefinitions: [
            createStepDefinition({
              id: 'rich-step',
              editorConfig: { format: 'rich', placeholderText: 'step.rich.placeholder' },
            }),
          ],
        })
        const strings = { step: { 'rich-step': { label: 'Rich Step' } } }

        const result = await mapProjectToViewModel(project, template, strings)

        expect(result.canvas.nodes[0]?.type).toBe('richText')
      })

      it('maps step stage to node data', async () => {
        const project = createProjectData({
          steps: [createStep({ id: 'step-1', stepId: 'premise' })],
        })
        const template = createProcessTemplate({
          stepDefinitions: [createStepDefinition({ id: 'premise', stage: 5 })],
        })
        const strings = { step: { premise: { label: 'Premise' } } }

        const result = await mapProjectToViewModel(project, template, strings)

        expect(result.canvas.nodes[0]?.data?.stage).toBe(5)
      })

      it('maps stage as undefined when not defined in step definition', async () => {
        const project = createProjectData({
          steps: [createStep({ id: 'step-1', stepId: 'premise' })],
        })
        const template = createProcessTemplate({
          stepDefinitions: [createStepDefinition({ id: 'premise', stage: undefined })],
        })
        const strings = { step: { premise: { label: 'Premise' } } }

        const result = await mapProjectToViewModel(project, template, strings)

        expect(result.canvas.nodes[0]?.data?.stage).toBeUndefined()
      })

      it('maps step category to node data', async () => {
        const project = createProjectData({
          steps: [createStep({ id: 'step-1', stepId: 'character-step' })],
        })
        const template = createProcessTemplate({
          stepDefinitions: [createStepDefinition({ id: 'character-step', category: 'character' })],
        })

        const result = await mapProjectToViewModel(project, template, {})

        expect(result.canvas.nodes[0]?.data?.category).toBe('character')
      })

      it('maps the label by from the labelText key to values from strings', async () => {
        const project = createProjectData({
          steps: [createStep({ id: 'step-1', stepId: 'premise' })],
        })
        const template = createProcessTemplate({
          stepDefinitions: [
            createStepDefinition({ id: 'premise', labelText: 'step.premise.label' }),
          ],
        })

        const strings = { step: { premise: { label: 'My Custom Label' } } }

        const result = await mapProjectToViewModel(project, template, strings)

        expect(result.canvas.nodes[0]?.data?.label).toBe('My Custom Label')
      })

      it('falls back to the labelText key when strings missing label text', async () => {
        const project = createProjectData({
          steps: [createStep({ id: 'step-1', stepId: 'premise' })],
        })
        const template = createProcessTemplate({
          stepDefinitions: [
            createStepDefinition({ id: 'premise', labelText: 'step.missing.label' }),
          ],
        })
        const strings = { step: {} }

        const result = await mapProjectToViewModel(project, template, strings)

        expect(result.canvas.nodes[0]?.data?.label).toBe('step.missing.label')
      })
    })

    describe('layout', () => {
      it('orders nodes by stage and then step definition order', async () => {
        const project = createProjectData({
          steps: [
            createStep({ id: 'step-3', stepId: 'late-stage' }),
            createStep({ id: 'step-4', stepId: 'mid-stage-2' }),
            createStep({ id: 'step-1', stepId: 'early-stage' }),
            createStep({ id: 'step-2', stepId: 'mid-stage' }),
          ],
        })
        const template = createProcessTemplate({
          stepDefinitions: [
            createStepDefinition({ id: 'early-stage', stage: 1 }),
            createStepDefinition({ id: 'mid-stage', stage: 2 }),
            createStepDefinition({ id: 'mid-stage-2', stage: 2 }),
            createStepDefinition({ id: 'late-stage', stage: 3 }),
          ],
        })

        const result = await mapProjectToViewModel(project, template, {})

        expect(result.canvas.nodes).toHaveLength(4)
        expect(result.canvas.nodes[0]?.data?.stepId).toBe('early-stage')
        expect(result.canvas.nodes[1]?.data?.stepId).toBe('mid-stage')
        expect(result.canvas.nodes[2]?.data?.stepId).toBe('mid-stage-2')
        expect(result.canvas.nodes[3]?.data?.stepId).toBe('late-stage')
      })

      it('applies positions from layout engine', async () => {
        const project = createProjectData({
          steps: [createStep({ id: 'step-1', stepId: 'premise' })],
        })
        const template = createProcessTemplate({
          stepDefinitions: [createStepDefinition({ id: 'premise' })],
        })
        const strings = { step: { premise: { label: 'Premise' } } }

        const result = await mapProjectToViewModel(project, template, strings)

        expect(result.canvas.nodes[0]?.position).toBeDefined()
        expect(result.canvas.nodes[0]?.position.x).toBeTypeOf('number')
        expect(result.canvas.nodes[0]?.position.y).toBeTypeOf('number')
      })
    })
  })
})
