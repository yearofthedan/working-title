import { describe, it, expect } from 'vitest'
import { render } from '@/__testHelpers__/renderer'
import { page } from 'vitest/browser'
import CanvasStepMenu from './CanvasStepMenu.vue'

describe('CanvasStepMenu', () => {
  it('renders with label', async () => {
    render(CanvasStepMenu, {
      props: {
        label: 'Test Action',
      },
    })

    await expect.element(page.getByText('Test Action')).toBeVisible()
  })

  it('emits click event when clicked', async () => {
    const { emitted } = render(CanvasStepMenu, {
      props: {
        label: 'Click Me',
      },
    })

    await page.getByText('Click Me').click()
    expect(emitted().click).toBeDefined()
    expect(emitted().click).toHaveLength(1)
  })

  it('is disabled when prop is set', async () => {
    render(CanvasStepMenu, {
      props: {
        label: 'Disabled Action',
        disabled: true,
      },
    })

    const button = page.getByText('Disabled Action')
    await expect.element(button).toBeDisabled()
  })
})
