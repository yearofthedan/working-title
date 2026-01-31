import { describe, it, expect, vi, type Mock } from 'vitest'
import { buildGlobals, render } from '@/__testHelpers__/renderer'
import { page, userEvent } from 'vitest/browser'
import WritingProject from './WritingProject.vue'
import { template } from '@/features/process-templates/snowflake/template'
import { ref } from 'vue'
import { buildProjectData, buildStep } from '../project-storage/__testHelpers__/builders'
import { createTestI18n } from '@/i18n/__testHelpers__/i18n-utils'

const navigateToNodeSpy = vi.fn()
const navigateToNewNodeSpy = vi.fn()
vi.mock('./project-canvas/composables/useCanvasNavigation', () => ({
  useCanvasNavigation: () => ({
    navigateToNode: navigateToNodeSpy,
    navigateToNewNode: navigateToNewNodeSpy,
  }),
}))

const strings = {
  'app.canvas.emptyState.title': 'Start Your Story',
  'app.canvas.emptyState.description': 'Begin by adding your first step to the canvas.',
  'template.root.actions.create_summary': 'Create One Sentence Summary',
  'template.step.summary.label': 'One Sentence Summary',
  'template.step.summary.placeholder': '',
  'template.step.summary.instruction': '',
  'template.step.summary.actions.expand_to_storyline': 'Expand to Storyline',
  'template.step.storyline.label': 'Storyline',
  'template.step.storyline.placeholder': '',
  'template.step.storyline.instruction': '',
  'writingProject.sidebar.contextTitle': 'Project Context',
}

describe('WritingProject Integration', () => {
  const renderComponent = (data = ref(buildProjectData())) => {
    const project = {
      data: data.value,
      template,
    }
    return render(WritingProject, {
      props: {
        project,
      },
      global: buildGlobals({
        plugins: [
          createTestI18n({
            en: strings,
          }),
        ],
      }),
      attrs: {
        style: 'height: 100vh; width: 100vw;',
      },
    })
  }

  it('displays the project name in the sidebar', async () => {
    const data = ref(
      buildProjectData({
        meta: {
          name: 'My Epic Story',
          created: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      })
    )
    renderComponent(data)

    await expect.element(page.getByText('My Epic Story')).toBeVisible()
    await expect.element(page.getByText('Project Context')).toBeVisible()
  })

  it('updates project data when node content changes', async () => {
    const data = ref(
      buildProjectData({
        steps: [
          buildStep({
            id: '1',
            stepId: 'step-summary',
            content: { text: '<p>Initial content</p>' },
          }),
        ],
      })
    )
    renderComponent(data)

    const richTextNode = page.getByText('Initial content')

    await expect.element(richTextNode).toBeVisible()
    await richTextNode.click()
    const editor = page.getByRole('textbox')
    await editor.fill('Updated via integration')
    await userEvent.tab()

    await vi.waitFor(() =>
      expect(data.value.steps[0]!.content.text).toContain('Updated via integration')
    )
  })

  it('adds a new root step when clicking the action button in EmptyCanvas', async () => {
    const data = ref(
      buildProjectData({
        steps: [],
      })
    )

    renderComponent(data)

    const startHeading = page.getByText(/Start Your Story/i)
    await expect.element(startHeading).toBeVisible()

    const createButton = page.getByRole('button', { name: /Create One Sentence Summary/i })
    await expect.element(createButton).toBeVisible()

    await createButton.click()

    await vi.waitFor(() => expect(data.value.steps.length).toBe(1))
    expect(data.value.steps[0]!.stepId).toBe('step-summary')

    await expect.element(startHeading).not.toBeInTheDocument()
    await expect.element(page.getByText('One Sentence Summary')).toBeVisible()
  })

  it('adds a child node and navigates to it when clicking an action button', async () => {
    const data = ref(
      buildProjectData({
        steps: [
          buildStep({
            id: '1',
            stepId: 'step-summary',
            content: { text: '<p>Summary</p>' },
          }),
        ],
      })
    )
    renderComponent(data)

    const node = page.getByText('Summary', { exact: true })
    await expect.element(node).toBeVisible()

    // Hover to reveal action buttons
    await node.hover()

    const expandButton = page.getByRole('button', { name: /Expand to Storyline/i })
    await expect.element(expandButton).toBeVisible()

    await expandButton.click()

    await vi.waitFor(() => expect(data.value.steps.length).toBe(2))
    const newNode = data.value.steps.find((s) => s.stepId === 'step-storyline')
    expect(newNode).toBeDefined()

    // Verify navigation was triggered for the new node ID
    await vi.waitFor(() => {
      const calls = (navigateToNewNodeSpy as Mock).mock.calls
      const found = calls.some((call) => call[0] === newNode?.id)
      expect(found).toBe(true)
    })

    await expect.element(page.getByText('Storyline')).toBeVisible()
  })
})
