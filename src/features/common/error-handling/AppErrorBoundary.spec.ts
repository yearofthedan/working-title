import { describe, expect, vi } from 'vitest'
import { h, defineComponent } from 'vue'
import { it } from '@/__testHelpers__/fixtures'
import { page } from 'vitest/browser'
import { render, buildGlobals } from '@/__testHelpers__/renderer'
import AppErrorBoundary from './AppErrorBoundary.vue'
import { refreshPage } from '@/utils/browsers'

vi.mock('@/utils/browsers', () => ({
  refreshPage: vi.fn(),
  supportsFilePicker: vi.fn(() => true),
}))

const ThrowingComponent = defineComponent({
  setup() {
    throw new Error('I caused a crash')
  },
  template: '<div>Should not render</div>',
})

describe('AppErrorBoundary', () => {
  it.scoped({ globalMocks: ['logging'] })

  it('renders children when no error occurs', async () => {
    render(AppErrorBoundary, {
      global: buildGlobals(),
      slots: {
        default: () => h('div', 'Normal content'),
      },
    })

    await expect.element(page.getByText('Normal content')).toBeVisible()
    await expect.element(page.getByRole('alert')).not.toBeInTheDocument()
  })

  it('renders AppError UI and logs fatal error on crash', async ({ logHandler }) => {
    render(AppErrorBoundary, {
      global: buildGlobals(),
      slots: {
        default: () => h(ThrowingComponent),
      },
    })

    await expect
      .element(page.getByRole('alert').getByRole('heading', { name: 'Application Error' }))
      .toBeVisible()

    expect(logHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'fatal',
        message: expect.stringContaining('I caused a crash'),
      })
    )
  })

  it('calls refreshPage on button click', async () => {
    render(AppErrorBoundary, {
      global: buildGlobals(),
      slots: {
        default: () => h(ThrowingComponent),
      },
    })

    await page.getByRole('button', { name: /Refresh/i }).click()
    expect(refreshPage).toHaveBeenCalled()
  })
})
