import { describe, it, expect, vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import { page, userEvent } from 'vitest/browser'
import RichTextNode from './RichTextNode.vue'

describe('RichTextNode', () => {
  const defaultData = {
    id: '1',
    stepId: 'step-1',
    category: 'structure' as const,
    label: 'Test Node',
    content: '<p>Initial content</p>',
    type: 'richText' as const,
    sortOrder: 0,
  }

  it('debounces content updates', async () => {
    const { emitted } = render(RichTextNode, {
      props: {
        data: defaultData,
      },
    })

    const editor = page.getByRole('textbox')
    await editor.click()
    await editor.fill('Updated content')

    expect(emitted()['update:content']).toBeUndefined()

    await vi.waitUntil(() => emitted()['update:content'] !== undefined)

    expect(emitted()['update:content']).toHaveLength(1)
    expect(emitted()['update:content']?.[0]).toEqual(['<p>Updated content</p>'])
  })

  it('flushes updates on blur', async () => {
    const { emitted } = render(RichTextNode, {
      props: {
        data: defaultData,
      },
    })

    const editor = page.getByRole('textbox')
    await editor.click()

    await editor.fill('Fast update')
    await vi.waitUntil(() => editor.element().innerHTML.includes('Fast update'))
    expect(emitted()['update:content']).toBeUndefined()

    await userEvent.tab()
    await vi.waitUntil(() => emitted()['update:content'] !== undefined)

    expect(emitted()['update:content']).toHaveLength(1)
    expect(emitted()['update:content']?.[0]).toEqual(['<p>Fast update</p>'])
  })
})
