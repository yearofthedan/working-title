import { describe, expect, vi } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'

import { render } from '@/__testHelpers__/renderer'
import { page, userEvent } from 'vitest/browser'
import CanvasStep from './CanvasStep.vue'
import { DEFAULT_DEBOUNCE } from '@/composables/useDebouncedEmit'
import { CanvasStepPageObject } from './__testHelpers__/CanvasStepPageObject'
import type { CanvasStepProps } from '../stepTypes'

describe('CanvasStep', () => {
  const renderComponent = (
    props: CanvasStepProps = {
      id: '1',
      definition: {
        label: 'Test Node',
        placeholder: 'Enter text...',
        category: 'structure',
      },
      content: {
        text: '<p>Initial content</p>',
      },
    }
  ) => {
    const rendered = render(CanvasStep, { props })
    const po = new CanvasStepPageObject(page)
    return { ...rendered, po }
  }

  it('renders correctly with props', async () => {
    renderComponent()
    await expect.element(page.getByText('Test Node')).toBeVisible()
    await expect.element(page.getByText('structure')).toBeVisible()
    await expect.element(page.getByText('Initial content')).toBeVisible()
  })

  it('renders in read until clicked', async () => {
    const { po } = renderComponent()

    await expect.element(po.textbox).toBeVisible()
    await expect.element(po.textbox).toHaveAttribute('contenteditable', 'false')
    await po.clickToEdit()
    await expect.element(po.textbox).toHaveAttribute('contenteditable', 'true')
  })

  it('debounces content updates', async () => {
    const { emitted, po } = renderComponent()

    await po.clickToEdit()
    await expect.element(po.textbox).toHaveAttribute('contenteditable', 'true')

    vi.useFakeTimers()
    await po.textbox.fill('Updated content')
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
    const { emitted, po } = renderComponent()

    await po.clickToEdit()
    await expect.element(po.textbox).toHaveAttribute('contenteditable', 'true')

    vi.useFakeTimers()
    await po.textbox.fill('Fast update')
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
    renderComponent({
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
    const { emitted, po } = renderComponent({
      id: '1',
      definition: { label: 'Node' },
      content: { text: '' },
      actions: [action],
    })

    await po.actionButton('Append Step').click()
    expect(emitted()['action-click']).toBeDefined()
    expect(emitted()['action-click']?.[0]).toEqual([action])
  })
})
