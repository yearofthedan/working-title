import { describe, it, expect } from 'vitest'
import { render } from '@/__testHelpers__/renderer'
import SaveStatusIndicator from './SaveStatusIndicator.vue'

describe('SaveStatusIndicator', () => {
  it('renders saved state', () => {
    const { getByText } = render(SaveStatusIndicator, {
      props: { status: 'success' },
    })
    expect(getByText('Saved')).toBeDefined()
  })

  it('renders saving state', () => {
    const { getByText } = render(SaveStatusIndicator, {
      props: { status: 'loading' },
    })
    expect(getByText('Saving...')).toBeDefined()
  })

  it('renders error state', () => {
    const { getByText } = render(SaveStatusIndicator, {
      props: { status: 'error', error: new Error('Disk full') },
    })
    expect(getByText('Error saving')).toBeDefined()
  })

  it('renders idle state as saved', () => {
    const { getByText } = render(SaveStatusIndicator, {
      props: { status: 'idle' },
    })
    expect(getByText('Saved')).toBeDefined()
  })
})
