import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useProjectMutations } from './useProjectMutations'
import type { ProjectData } from '@/features/writing-project/domain/types'

vi.mock('@/utils/dates', () => ({
  now: vi.fn(() => '2026-01-11T20:00:00Z'),
}))

import { now } from '@/utils/dates'
import { buildProjectData, buildStep } from './__testHelpers__/builders'

describe('useProjectMutations', () => {
  const mockNow = '2026-01-11T20:00:00Z'

  beforeEach(() => {
    vi.mocked(now).mockReturnValue(mockNow)
  })

  describe('addStep', () => {
    it('adds a new step and updates lastModified', () => {
      const project = ref<ProjectData>(
        buildProjectData({
          steps: [],
          connections: [],
        })
      )
      const mutations = useProjectMutations(project)
      const newStepId = mutations.addStep('step-type-1')

      expect(newStepId).toBeTypeOf('string')
      expect(project.value.steps).toHaveLength(1)
      expect(project.value.steps[0]).toEqual({
        id: expect.anything(),
        stepId: 'step-type-1',
        content: {
          text: '',
        },
      })
      expect(project.value.meta.lastModified).toBe(mockNow)
    })

    it('creates a connection if sourceStepId is provided', () => {
      const project = ref<ProjectData>(
        buildProjectData({
          steps: [buildStep({ id: 'step1Id' })],
          connections: [],
        })
      )

      const mutations = useProjectMutations(project)
      const step2Id = mutations.addStep('type-2', 'step1Id')

      expect(step2Id).toBe(project.value.steps[1]!.id)
      expect(project.value.steps).toHaveLength(2)
      expect(project.value.connections).toHaveLength(1)
      expect(project.value.connections[0]!.source).toBe('step1Id')
      expect(project.value.connections[0]!.target).toBe(step2Id)
    })
  })

  describe('updateStepContent', () => {
    it('updates content and lastModified', () => {
      const project = ref<ProjectData>(
        buildProjectData({
          steps: [
            buildStep({
              id: 'step1Id',
              content: {
                text: '',
              },
            }),
          ],
          connections: [],
        })
      )
      const mutations = useProjectMutations(project)

      const newContent = 'Updated content'
      const updatedTime = '2026-01-11T21:00:00Z'
      vi.mocked(now).mockReturnValue(updatedTime)

      mutations.updateStepContent('step1Id', newContent)

      expect(project.value.steps[0]!.content.text).toBe(newContent)
      expect(project.value.meta.lastModified).toBe(updatedTime)
    })
  })

  describe('addConnection', () => {
    it('adds a connection and updates lastModified', () => {
      const project = ref<ProjectData>(
        buildProjectData({
          steps: [buildStep({ id: 'step1Id' }), buildStep({ id: 'step2Id' })],
          connections: [],
        })
      )
      const mutations = useProjectMutations(project)
      mutations.addConnection('step1Id', 'step2Id')

      expect(project.value.connections).toHaveLength(1)
      expect(project.value.connections[0]).toEqual({
        id: expect.anything(),
        source: 'step1Id',
        target: 'step2Id',
      })
      expect(project.value.meta.lastModified).toBe(mockNow)
    })
  })
})
