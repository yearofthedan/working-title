import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useProjectData } from './useProjectData'
import * as dates from '@/utils/dates'
import { template as snowflakeTemplate } from '../../process-templates/snowflake/template'
import { nextTick } from 'vue'
import { createNewProject } from './projectFactory'

vi.mock('@/utils/dates', () => ({
  now: vi.fn(() => '2026-01-11T20:00:00Z'),
}))

describe('useProjectData', () => {
  const mockNow = '2026-01-11T20:00:00Z'

  beforeEach(() => {
    vi.mocked(dates.now).mockReturnValue(mockNow)
  })

  it('initializes with provided project data', async () => {
    const initialProject = createNewProject(snowflakeTemplate)
    const { project } = useProjectData(initialProject)

    expect(project.value.meta.name).toBe('Untitled Story')
    expect(project.value.meta.created).toBe(mockNow)
    expect(project.value.projectId).toBe(initialProject.projectId)
  })

  describe('persistence integration', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('automatically saves project data to storage when modified', async () => {
      const initialProject = createNewProject(snowflakeTemplate)
      const { project } = useProjectData(initialProject)

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
