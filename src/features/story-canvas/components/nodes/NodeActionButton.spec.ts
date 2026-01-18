import { describe, it, expect } from 'vitest'
import { render } from 'vitest-browser-vue'
import { page } from 'vitest/browser'
import NodeActionButton from './NodeActionButton.vue'

describe('NodeActionButton', () => {
  it('renders with label', async () => {
    render(NodeActionButton, {
      props: {
        label: 'Test Action',
      },
    })

    await expect.element(page.getByText('Test Action')).toBeVisible()
  })

  it('emits click event when clicked', async () => {
    const { emitted } = render(NodeActionButton, {
      props: {
        label: 'Click Me',
      },
    })

    await page.getByText('Click Me').click()
    expect(emitted().click).toBeDefined()
    expect(emitted().click).toHaveLength(1)
  })

  it('is disabled when prop is set', async () => {
    render(NodeActionButton, {
      props: {
        label: 'Disabled Action',
        disabled: true,
      },
    })

    const button = page.getByText('Disabled Action')
    await expect.element(button).toBeDisabled()
  })
})
