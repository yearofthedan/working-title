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
import { ref, type Ref } from 'vue'
import type { ProjectData } from '@/features/project-storage/types'
import {
  buildProjectData,
  buildProjectStore,
} from '@/features/project-storage/__testHelpers__/builders'
import {
  buildProcessTemplate,
  buildStepDefinition,
} from '@/features/process-templates/__testHelpers__/builders'

describe('StepPanel', () => {
  let projectData: Ref<ProjectData>

  const renderComponent = () => {
    const template = ref(
      buildProcessTemplate({
        stepDefinitions: [
          buildStepDefinition({
            id: 'step-1',
            labelText: 'template.step.summary.label',
          }),
        ],
      })
    )

    projectData = ref(
      buildProjectData({
        steps: [
          {
            id: 'node-1',
            stepId: 'step-1',
            content: { text: '<p>Initial Content</p>' },
          },
        ],
      })
    )

    const store = buildProjectStore()

    render(StepPanel, {
      global: buildGlobals({
        provide: buildProviders({
          [DEFINITIONS_CONTEXT_KEY]: definitionsContext(template),
          [ACTIVE_PROJECT_CONTEXT_KEY]: activeProjectContext(projectData, store),
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

  it('initializes Tiptap editor with step content', async () => {
    const { openPanel } = useDetailPanel()
    renderComponent()

    openPanel('node-1')

    // This is the RED test for Slice 3
    await expect.element(page.getByRole('textbox')).toBeVisible()
    await expect.element(page.getByText('Initial Content')).toBeInTheDocument()
  })

  it('updates project data when typing in editor', async () => {
    const { openPanel } = useDetailPanel()
    renderComponent()

    openPanel('node-1')

    const editor = page.getByRole('textbox')
    await editor.fill('Updated content')
    // Click header to blur
    await page.getByRole('heading').click()

    expect(projectData.value.steps?.[0]?.content?.text).toContain('Updated content')
  })

  it('debounces and persists content updates to storage', async () => {
    const { openPanel } = useDetailPanel()
    renderComponent()

    openPanel('node-1')

    const editor = page.getByRole('textbox')
    await editor.fill('First update')
    await editor.fill('Second update')

    // Click header to blur and trigger flush
    await page.getByRole('heading').click()

    await vi.waitFor(() => {
      expect(projectData.value.steps?.[0]?.content?.text).toContain('Second update')
    })
  })
})
