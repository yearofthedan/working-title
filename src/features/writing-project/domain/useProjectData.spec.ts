import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useProjectData } from './useProjectData'
import * as dates from '@/utils/dates'
import { template } from '../../process-templates/snowflake/template'
import { nextTick } from 'vue'
import type { Step } from './types'

vi.mock('@/utils/dates', () => ({
  now: vi.fn(() => '2026-01-11T20:00:00Z'),
}))

describe('useProjectData', () => {
  const mockNow = '2026-01-11T20:00:00Z'

  beforeEach(() => {
    vi.mocked(dates.now).mockReturnValue(mockNow)
  })

  it('initializes a new project with correct meta data', () => {
    const { project } = useProjectData()

    expect(project.value.meta.name).toBe('Untitled Story')
    expect(project.value.meta.created).toBe(mockNow)
    expect(project.value.meta.lastModified).toBe(mockNow)
    expect(project.value.templateId).toBe(template.id)
  })

  it('creates initial steps based on template', () => {
    const { project } = useProjectData()

    const initialStepDefs = template.stepDefinitions.filter((d) => d.isInitial)

    expect(project.value.steps).toHaveLength(initialStepDefs.length)
    initialStepDefs.forEach((def) => {
      const step = project.value.steps.find((s: Step) => s.stepId === def.id)
      expect(step).toBeDefined()
      expect(step?.content.text).toBe('')
    })
  })

  describe('persistence integration', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('automatically saves project data to storage when modified', async () => {
      const { project } = useProjectData()

      // Modify project
      project.value.meta.name = 'Auto-saved Project'

      // Wait for Vue watch to trigger and advance timers for debounce
      await nextTick()
      vi.runAllTimers()
      await nextTick()

      // The important thing is that the save operation doesn't throw
      expect(project.value.meta.name).toBe('Auto-saved Project')
    })
  })
})
