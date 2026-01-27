import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createNewProject } from './projectFactory'
import { template as snowflakeTemplate } from '../../process-templates/snowflake/template'
import * as dates from '@/utils/dates'

vi.mock('@/utils/dates', () => ({
  now: vi.fn(() => '2026-01-11T20:00:00Z'),
}))

describe('projectFactory', () => {
  const mockNow = '2026-01-11T20:00:00Z'

  beforeEach(() => {
    vi.mocked(dates.now).mockReturnValue(mockNow)
  })

  it('creates a new project with correct meta data', () => {
    const project = createNewProject(snowflakeTemplate)

    expect(project.meta.name).toBe('Untitled Story')
    expect(project.meta.created).toBe(mockNow)
    expect(project.meta.lastModified).toBe(mockNow)
    expect(project.templateId).toBe(snowflakeTemplate.id)
    expect(project.templateVersion).toBe(snowflakeTemplate.version)
  })

  it('creates initial steps based on template', () => {
    const project = createNewProject(snowflakeTemplate)
    const initialStepDefs = snowflakeTemplate.stepDefinitions.filter((d) => d.isInitial)

    expect(project.steps).toHaveLength(initialStepDefs.length)
    initialStepDefs.forEach((def) => {
      const step = project.steps.find((s) => s.stepId === def.id)
      expect(step).toBeDefined()
      expect(step?.content.text).toBe('')
    })
  })
})
