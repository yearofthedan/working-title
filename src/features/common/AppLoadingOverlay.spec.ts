import { describe, expect, it } from 'vitest'
import { render } from '@/__testHelpers__/renderer'
import { page } from 'vitest/browser'
import AppLoadingOverlay from './AppLoadingOverlay.vue'

describe('AppLoadingOverlay', () => {
  it('displays a status message and spinner when loading', async () => {
    render(AppLoadingOverlay, {
      props: {
        isLoading: true,
        message: 'Uploading data...',
      },
    })

    const status = page.getByRole('status', { name: 'Uploading data...' })
    await expect.element(status).toHaveTextContent('Uploading data...')
  })

  it('displays no message, but has a default aria label when no status message provided', async () => {
    render(AppLoadingOverlay, {
      props: {
        isLoading: true,
      },
    })

    await expect.element(page.getByRole('status', { name: 'Loading...' })).toBeVisible()
  })

  it('does not render when not loading', async () => {
    render(AppLoadingOverlay, {
      props: {
        isLoading: false,
      },
    })

    await expect.element(page.getByRole('status')).not.toBeInTheDocument()
  })

  it('has correct ARIA attributes for accessibility', async () => {
    render(AppLoadingOverlay, {
      props: {
        isLoading: true,
      },
    })

    const status = page.getByRole('status')
    await expect.element(status).toHaveAttribute('aria-live', 'polite')
    await expect.element(status).toHaveAttribute('aria-atomic', 'true')
  })
})
