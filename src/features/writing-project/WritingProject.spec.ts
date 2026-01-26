import { describe, it, expect, vi } from 'vitest'
import { render } from '@/__testHelpers__/renderer'
import { page, userEvent } from 'vitest/browser'
import WritingProject from './WritingProject.vue'
import { template } from '@/features/process-templates/snowflake/template'
import { strings } from '@/features/process-templates/snowflake/strings'
import { ref } from 'vue'
import { buildProjectData, buildStep } from './storage/__testHelpers__/builders'

const navigateToNodeSpy = vi.fn()
const navigateToNewNodeSpy = vi.fn()
vi.mock('./project-canvas/composables/useCanvasNavigation', () => ({
  useCanvasNavigation: () => ({
    navigateToNode: navigateToNodeSpy,
    navigateToNewNode: navigateToNewNodeSpy,
  }),
}))

describe('WritingProject Integration', () => {
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
    render(WritingProject, {
      props: {
        data: data.value,
        template,
        strings,
      },
      attrs: {
        style: 'height: 100vh; width: 100vw;',
      },
    })

    const richTextNode = page.getByText('Initial content')

    await expect.element(richTextNode).toBeVisible()
    await richTextNode.click()
    await richTextNode.fill('Updated via integration')
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
    render(WritingProject, {
      props: {
        data: data.value,
        template,
        strings,
      },
      attrs: {
        style: 'height: 100vh; width: 100vw;',
      },
    })

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
    render(WritingProject, {
      props: {
        data: data.value,
        template,
        strings,
      },
      attrs: {
        style: 'height: 100vh; width: 100vw;',
      },
    })

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
    await vi.waitFor(() => expect(navigateToNewNodeSpy).toHaveBeenCalledWith(newNode?.id))

    await expect.element(page.getByText('Storyline')).toBeVisible()
  })
})
