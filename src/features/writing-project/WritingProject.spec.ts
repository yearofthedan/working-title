import { describe, expect, vi } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'

import { render } from '@/__testHelpers__/renderer'
import { page, userEvent } from 'vitest/browser'
import WritingProject from './WritingProject.vue'
import { template as snowflakeTemplate } from '@/features/process-templates/snowflake/template'
import { ref } from 'vue'
import { buildProjectData, buildStep } from '../project-storage/__testHelpers__/builders'
import { WritingProjectPageObject } from './__testHelpers__/WritingProjectPageObject'
import snowflake from '@/features/process-templates/snowflake/locales/en.json'

const navigateToNodeSpy = vi.fn()
const navigateToNewNodeSpy = vi.fn()
vi.mock('./canvas/composables/useCanvasNavigation', () => ({
  useCanvasNavigation: () => ({
    navigateToNode: navigateToNodeSpy,
    navigateToNewNode: navigateToNewNodeSpy,
  }),
}))

describe('WritingProject', () => {
  it.scoped({ globalMocks: ['logging'] })

  const renderComponent = (data = ref(buildProjectData())) => {
    const project = {
      data: data.value,
      template: snowflakeTemplate,
    }
    const rendered = render(WritingProject, {
      props: {
        project,
      },
      attrs: {
        style: 'height: 100vh; width: 100vw;',
      },
    })
    const po = new WritingProjectPageObject(page)

    return { ...rendered, po }
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
    const { po } = renderComponent(data)

    await expect.element(po.sidebar.host).toBeVisible()
    await expect.element(po.sidebar.projectNameHeading).toBeVisible()
    await expect.element(po.sidebar.host.getByText('My Epic Story')).toBeVisible()
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

    const { po } = renderComponent(data)

    const step = po.canvas.stepByType(snowflake.template.step.summary.label)
    await expect.element(step.host).toBeVisible()
    await expect.element(step.host).toHaveTextContent('Initial content')

    await expect.element(step.textbox).toHaveAttribute('contenteditable', 'false')
    await step.clickToEdit()
    await expect.element(step.textbox).toHaveAttribute('contenteditable', 'true')
    await step.textbox.fill('Updated via integration')
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

    const { po } = renderComponent(data)

    await expect.element(po.canvas.emptyState.title).toBeVisible()

    await po.canvas.emptyState.actionButton(snowflake.template.root.actions.create_summary).click()

    await vi.waitFor(() => expect(data.value.steps.length).toBe(1))
    expect(data.value.steps[0]!.stepId).toBe('step-summary')

    await expect.element(po.canvas.emptyState.title).not.toBeInTheDocument()
    await expect.element(page.getByText(snowflake.template.step.summary.label)).toBeVisible()
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

    const { po } = renderComponent(data)

    const step = po.canvas.stepByType(snowflake.template.step.summary.label)

    await expect.element(step.host).toBeVisible()
    await step.hover()

    const expandButton = step.actionButton(
      snowflake.template.step.summary.actions.expand_to_storyline
    )
    await expect.element(expandButton).toBeVisible()

    await expandButton.click()

    await vi.waitFor(() => expect(data.value.steps.length).toBe(2))
    const newNode = data.value.steps.find((s) => s.stepId === 'step-storyline')
    expect(newNode).toBeDefined()

    await vi.waitFor(() => {
      const calls = navigateToNewNodeSpy.mock.calls
      const found = calls.some((call) => call[0] === newNode?.id)
      expect(found).toBe(true)
    })

    await expect
      .element(po.canvas.host.getByText(snowflake.template.step.storyline.label))
      .toBeVisible()
  })

  it('opens the detail panel when clicking a node', async () => {
    const data = ref(
      buildProjectData({
        steps: [
          buildStep({
            id: '1',
            stepId: 'step-plot-synopsis',
            content: { text: '<p>Detailed synopsis</p>' },
          }),
        ],
      })
    )

    const { po } = renderComponent(data)

    const step = po.canvas.stepByType(snowflake.template.step.plot_synopsis.label)
    await expect.element(step.host).toBeVisible()
    await step.clickExpand()

    await expect.element(po.detailPanel.host).toBeVisible()
    await expect.element(po.detailPanel.title).toBeVisible()
    await expect
      .element(po.detailPanel.host.getByText(snowflake.template.step.plot_synopsis.label))
      .toBeVisible()
    await expect.element(po.detailPanel.contentArea.getByText('Detailed synopsis')).toBeVisible()
  })
})
