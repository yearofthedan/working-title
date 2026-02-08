import { describe, expect, beforeEach, vi } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'
import { render, buildGlobals } from '@/__testHelpers__/renderer'
import { buildProviders } from '@/__testHelpers__/builders'
import { page } from 'vitest/browser'
import StepPanel from './StepPanel.vue'
import {
  ACTIVE_PROJECT_CONTEXT_KEY,
  activeProjectContext,
} from '../composables/useActiveProjectContext'
import { DEFINITIONS_CONTEXT_KEY, definitionsContext } from '../composables/useDefinitionsContext'
import { useDetailPanel } from './useDetailPanel'
import { ref } from 'vue'
import {
  buildProjectData,
  buildProjectStore,
} from '@/features/project-storage/__testHelpers__/builders'
import {
  buildProcessTemplate,
  buildStepDefinition,
} from '@/features/process-templates/__testHelpers__/builders'

describe('StepPanel', () => {
  const template = buildProcessTemplate({
    stepDefinitions: [
      buildStepDefinition({
        id: 'step-1',
        labelText: 'template.step.summary.label',
      }),
    ],
  })

  const projectData = buildProjectData({
    steps: [
      {
        id: 'node-1',
        stepId: 'step-1',
        content: { text: '<p>Initial Content</p>' },
      },
    ],
  })

  const store = buildProjectStore()

  const renderComponent = () => {
    render(StepPanel, {
      global: buildGlobals({
        provide: buildProviders({
          [DEFINITIONS_CONTEXT_KEY]: definitionsContext(ref(template)),
          [ACTIVE_PROJECT_CONTEXT_KEY]: activeProjectContext(ref(projectData), store),
        }),
      }),
    })
  }

  beforeEach(() => {
    const { closePanel } = useDetailPanel()
    closePanel()
  })

  it('renders nothing when closed', async () => {
    renderComponent()
    await expect.element(page.getByRole('complementary')).not.toBeInTheDocument()
  })

  it('renders content when opened', async () => {
    const { openPanel } = useDetailPanel()
    renderComponent()

    openPanel('node-1')

    await expect.element(page.getByRole('complementary')).toBeVisible()
    // template.step.summary.label resolves to "One Sentence Summary" in test environment
    await expect.element(page.getByText(/One Sentence Summary/i)).toBeVisible()
  })

  it('closes when clicking close button', async () => {
    const { openPanel, isOpen } = useDetailPanel()
    renderComponent()

    openPanel('node-1')

    const closeButton = page.getByRole('button', { name: /close/i })
    await expect.element(closeButton).toBeVisible()
    await closeButton.click()

    await vi.waitFor(() => {
      expect(isOpen.value).toBe(false)
    })
  })
})
