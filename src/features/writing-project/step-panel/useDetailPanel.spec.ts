import { describe, it, expect, beforeEach } from 'vitest'
import { useDetailPanel } from './useDetailPanel'

describe('useDetailPanel', () => {
  beforeEach(() => {
    const { closePanel } = useDetailPanel()
    closePanel()
  })

  it('should have initial state closed', () => {
    const { isOpen } = useDetailPanel()
    expect(isOpen.value).toBe(false)
  })

  it('should have no active step initially', () => {
    const { activeStepId } = useDetailPanel()
    expect(activeStepId.value).toBeNull()
  })

  it('should open panel for a step', () => {
    const { openPanel, isOpen, activeStepId } = useDetailPanel()
    openPanel('step-1')
    expect(isOpen.value).toBe(true)
    expect(activeStepId.value).toBe('step-1')
  })

  it('should close panel', () => {
    const { openPanel, closePanel, isOpen, activeStepId } = useDetailPanel()
    openPanel('step-1')
    closePanel()
    expect(isOpen.value).toBe(false)
    expect(activeStepId.value).toBeNull()
  })
})
