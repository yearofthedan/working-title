import { describe, it, expect, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render, buildGlobals } from '@/__testHelpers__/renderer'
import BrowserSupportWarning from './BrowserSupportWarning.vue'
import { browserSupport } from '@/utils/browsers'

describe('BrowserSupportWarning', () => {
  it('renders nothing when browser is supported', async () => {
    vi.spyOn(browserSupport, 'supportsFilePicker').mockReturnValue(true)

    render(BrowserSupportWarning, {
      global: buildGlobals(),
    })

    const alert = page.getByRole('alert')
    await expect.element(alert).not.toBeInTheDocument()
  })

  it('renders warning when browser is not supported', async () => {
    vi.spyOn(browserSupport, 'supportsFilePicker').mockReturnValue(false)

    render(BrowserSupportWarning, {
      global: buildGlobals(),
    })

    const alert = page.getByRole('alert')
    await expect.element(alert).toBeVisible()
    await expect.element(alert).toHaveTextContent(/browser support warning/i)
  })
})
