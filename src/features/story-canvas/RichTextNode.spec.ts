import { describe, it, expect, vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import { page, userEvent } from 'vitest/browser'
import { ref } from 'vue'
import RichTextNode from './RichTextNode.vue'
import { CONTENT_CONTEXT_KEY, contentContext } from './composables/useContentContext'
import type { ProjectData } from '@/specs/projectDataSpec'
import { buildProjectData } from '@/specs/__testHelpers__/builders'
import { createCanvasNode } from './composables/__testHelpers__/builders'

describe('RichTextNode', () => {
  const renderComponent = (
    data = createCanvasNode({
      id: '1',
      stepId: 'step-1',
      category: 'structure' as const,
      label: 'Test Node',
      type: 'richText' as const,
      sortOrder: 0,
    })
  ) => {
    const updateFn = vi.fn()
    const projectData = ref<ProjectData>(
      buildProjectData({
        steps: [{ id: data.id, stepId: data.stepId, content: { text: '<p>Initial content</p>' } }],
        connections: [],
      })
    )

    render(RichTextNode, {
      props: {
        data,
      },
      global: {
        provide: {
          [CONTENT_CONTEXT_KEY]: contentContext(projectData, updateFn),
        },
      },
    })

    return { updateFn }
  }

  it('debounces content updates', async () => {
    const { updateFn } = renderComponent()

    const editor = page.getByRole('textbox')
    await editor.click()
    await editor.fill('Updated content')

    expect(updateFn).not.toHaveBeenCalled()

    await vi.waitUntil(() => updateFn.mock.calls.length > 0)

    expect(updateFn).toHaveBeenCalledTimes(1)
    expect(updateFn).toHaveBeenCalledWith('1', '<p>Updated content</p>')
  })

  it('flushes updates on blur', async () => {
    const { updateFn } = renderComponent()

    const editor = page.getByRole('textbox')
    await editor.click()

    await editor.fill('Fast update')
    await vi.waitUntil(() => editor.element().innerHTML.includes('Fast update'))
    expect(updateFn).not.toHaveBeenCalled()

    await userEvent.tab()
    await vi.waitUntil(() => updateFn.mock.calls.length > 0)

    expect(updateFn).toHaveBeenCalledTimes(1)
    expect(updateFn).toHaveBeenCalledWith('1', '<p>Fast update</p>')
  })
})
