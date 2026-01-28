import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useProjectData } from './useProjectData'
import * as dates from '@/utils/dates'
import { template as snowflakeTemplate } from '../../process-templates/snowflake/template'
import { createNewProject } from './projectFactory'
import type { ProjectStorage } from '../storage/ProjectStorage'

vi.mock('@/utils/dates', () => ({
  now: vi.fn(() => '2026-01-11T20:00:00Z'),
}))

describe('useProjectData', () => {
  const mockNow = '2026-01-11T20:00:00Z'

  beforeEach(() => {
    vi.mocked(dates.now).mockReturnValue(mockNow)
  })

  it('initializes with provided project data and save status', async () => {
    const initialProject = createNewProject(snowflakeTemplate)
    const { project, saveStatus, lastSaved, errorMessage } = useProjectData(initialProject)

    expect(project.value.meta.name).toBe('Untitled Story')
    expect(project.value.meta.created).toBe(mockNow)
    expect(project.value.projectId).toBe(initialProject.projectId)
    expect(saveStatus.value).toBe('saved')
    expect(lastSaved.value).toBeNull()
    expect(errorMessage.value).toBeNull()
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
      const mockSave = vi.fn().mockResolvedValue(undefined)

      const mockStorage = {
        save: mockSave,
        getFileHandle: vi.fn().mockResolvedValue(null),
      } as unknown as ProjectStorage

      const { project, saveStatus, lastSaved } = useProjectData(initialProject, mockStorage)

      expect(saveStatus.value).toBe('saved')
      expect(lastSaved.value).toBeNull()

      project.value.meta.name = 'Auto-saved Project'

      await vi.runAllTimersAsync()

      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          meta: expect.objectContaining({
            name: 'Auto-saved Project',
          }),
        })
      )

      expect(saveStatus.value).toBe('saved')
      expect(lastSaved.value).toBeInstanceOf(Date)
    })
  })
})
