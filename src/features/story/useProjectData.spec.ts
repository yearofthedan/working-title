import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useProjectData } from './useProjectData'
import * as dates from '@/utils/dates'
import { template } from '../process-templates/snowflake/template'

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
      const step = project.value.steps.find((s) => s.stepId === def.id)
      expect(step).toBeDefined()
      expect(step?.content.text).toBe('')
    })
  })
})
