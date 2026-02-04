import { describe, expect, vi } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'

import { render } from '@/__testHelpers__/renderer'
import { page, userEvent } from 'vitest/browser'
import CanvasStep from './CanvasStep.vue'
import { DEFAULT_DEBOUNCE } from '@/composables/useDebouncedEmit'

describe('CanvasStep', () => {
  const renderComponent = () => {
    return render(CanvasStep, {
      props: {
        id: '1',
        definition: {
          label: 'Test Node',
          placeholder: 'Enter text...',
          category: 'structure',
        },
        content: {
          text: '<p>Initial content</p>',
        },
      },
    })
  }

  it('renders correctly with props', async () => {
    renderComponent()
    await expect.element(page.getByText('Test Node')).toBeVisible()
    await expect.element(page.getByText('structure')).toBeVisible()
    await expect.element(page.getByText('Initial content')).toBeVisible()
  })

  it('renders in read until clicked', async () => {
    renderComponent()

    const editorContainer = page.getByPlaceholder('Enter text...')

    await expect.element(editorContainer).toBeVisible()
    await expect.element(editorContainer).toHaveAttribute('contenteditable', 'false')
    await editorContainer.click()
    await expect.element(editorContainer).toHaveAttribute('contenteditable', 'true')
    await expect.element(editorContainer).toHaveRole('textbox')
  })

  it('debounces content updates', async () => {
    const { emitted } = renderComponent()

    await page.getByPlaceholder('Enter text...').click()
    const editor = page.getByRole('textbox')
    await expect.element(editor).toBeVisible()

    vi.useFakeTimers()
    await editor.fill('Updated content')
    await vi.advanceTimersByTimeAsync(100)

    expect(emitted()['update:content']).toBeUndefined()

    await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE + 100)

    const events = emitted()['update:content']
    expect(events).toBeDefined()
    expect(events).toHaveLength(1)
    expect(events?.[0]).toEqual(['1', { text: '<p>Updated content</p>' }])
    vi.useRealTimers()
  })

  it('flushes updates on blur', async () => {
    const { emitted } = renderComponent()

    await page.getByPlaceholder('Enter text...').click()
    const editor = page.getByRole('textbox')
    await expect.element(editor).toBeVisible()

    vi.useFakeTimers()
    await editor.fill('Fast update')
    await userEvent.tab()
    await vi.advanceTimersByTimeAsync(100)

    // Blur should flush immediately
    const events = emitted()['update:content']
    expect(events).toBeDefined()
    expect(events).toHaveLength(1)
    expect(events?.[0]).toEqual(['1', { text: '<p>Fast update</p>' }])
    vi.useRealTimers()
  })

  it('renders actions when provided', async () => {
    render(CanvasStep, {
      props: {
        id: '1',
        definition: { label: 'Node' },
        content: { text: '' },
        actions: [
          {
            id: 'action-1',
            label: 'Append Step',
            trigger: 'append' as const,
            targetType: 'step-2',
            execute: vi.fn(),
          },
        ],
      },
    })

    await expect.element(page.getByText('Append Step')).toBeVisible()
  })

  it('emits action-click event when action button is clicked', async () => {
    const action = {
      id: 'action-1',
      label: 'Append Step',
      trigger: 'append' as const,
      targetType: 'step-2',
      execute: vi.fn(),
    }
    const { emitted } = render(CanvasStep, {
      props: {
        id: '1',
        definition: { label: 'Node' },
        content: { text: '' },
        actions: [action],
      },
    })

    await page.getByText('Append Step').click()
    expect(emitted()['action-click']).toBeDefined()
    expect(emitted()['action-click']?.[0]).toEqual([action])
  })
})
