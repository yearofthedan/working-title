import { describe, it, expect } from 'vitest'
import {
  buildProjectData,
  buildStep,
} from '@/features/writing-project/domain/__testHelpers__/builders'
import { useProjectViewModel } from '@/features/writing-project/view-model/useProjectViewModel'
import { ref } from 'vue'
import {
  buildProcessTemplate,
  buildStepDefinition,
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

    expect(viewModel.value.canvasSteps).toHaveLength(2)
    expect(viewModel.value.canvasSteps.map((n) => n.id)).toContain('step-1')
    expect(viewModel.value.canvasSteps.map((n) => n.id)).toContain('step-3')

    expect(viewModel.value.sidebarSteps).toHaveLength(2)
    expect(viewModel.value.sidebarSteps.map((n) => n.id)).toEqual(['step-2', 'step-3'])
  })
})
