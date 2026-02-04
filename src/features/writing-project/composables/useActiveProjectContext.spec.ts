import { describe, expect, beforeEach, afterEach, vi } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'

import { ref } from 'vue'
import { activeProjectContext, SAVE_DEBOUNCE } from './useActiveProjectContext'
import {
  buildInMemoryProjectStore,
  buildProjectData,
  buildStep,
} from '@/features/project-storage/__testHelpers__/builders'

vi.mock('@/utils/dates', () => ({
  now: vi.fn(() => '2026-01-11T20:00:00Z'),
}))

import { now } from '@/utils/dates'

describe('useActiveProjectContext', () => {
  it.scoped({ globalMocks: ['logging'] })

  const mockNow = '2026-01-11T20:00:00Z'

  beforeEach(() => {
    vi.mocked(now).mockReturnValue(mockNow)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('read access', () => {
    it('provides reactive steps and connections', () => {
      const project = ref(
        buildProjectData({
          steps: [buildStep({ id: 'step1' }), buildStep({ id: 'step2' })],
          connections: [{ id: 'conn1', source: 'step1', target: 'step2' }],
        })
      )
      const context = activeProjectContext(project, buildInMemoryProjectStore())

      expect(context.steps.value).toHaveLength(2)
      expect(context.connections.value).toHaveLength(1)
      expect(context.connections.value[0]).toEqual({
        id: 'conn1',
        source: 'step1',
        target: 'step2',
      })
    })

    it('provides contentMap computed from steps', () => {
      const project = ref(
        buildProjectData({
          steps: [
            buildStep({ id: 'step1', stepId: 'type1', content: { text: 'Content 1' } }),
            buildStep({ id: 'step2', stepId: 'type2', content: { text: 'Content 2' } }),
          ],
        })
      )
      const context = activeProjectContext(project, buildInMemoryProjectStore())

      expect(context.contentMap.value.size).toBe(2)
      expect(context.contentMap.value.get('step1')).toEqual({
        id: 'step1',
        stepId: 'type1',
        content: { text: 'Content 1' },
      })
    })

    it('getContent retrieves content by id', () => {
      const project = ref(
        buildProjectData({
          steps: [buildStep({ id: 'step1', content: { text: 'Test content' } })],
        })
      )
      const context = activeProjectContext(project, buildInMemoryProjectStore())

      const content = context.getContent('step1')
      expect(content).toBeDefined()
      expect(content?.content.text).toBe('Test content')
    })

    it('getStep retrieves step by id', () => {
      const project = ref(
        buildProjectData({
          steps: [buildStep({ id: 'step1', stepId: 'summary' })],
        })
      )
      const context = activeProjectContext(project, buildInMemoryProjectStore())

      const step = context.getStep('step1')
      expect(step).toBeDefined()
      expect(step?.stepId).toBe('summary')
    })
  })

  describe('addStep', () => {
    it('adds a new step and updates lastModified', async () => {
      const project = ref(
        buildProjectData({
          steps: [],
          connections: [],
        })
      )
      const context = activeProjectContext(project, buildInMemoryProjectStore())
      const newStepId = context.addStep('step-type-1')

      await vi.advanceTimersByTimeAsync(SAVE_DEBOUNCE + 100)

      expect(newStepId).toBeTypeOf('string')
      expect(project.value.steps).toHaveLength(1)
      expect(project.value.steps[0]).toEqual({
        id: expect.anything(),
        stepId: 'step-type-1',
        content: {
          text: '',
        },
      })

      expect(context.lastSaved.value).toBe(mockNow)
    })

    it('creates a connection if sourceStepId is provided', async () => {
      const project = ref(
        buildProjectData({
          steps: [buildStep({ id: 'step1Id' })],
          connections: [],
        })
      )

      const context = activeProjectContext(project, buildInMemoryProjectStore())
      const step2Id = context.addStep('type-2', 'step1Id')

      await vi.advanceTimersByTimeAsync(SAVE_DEBOUNCE + 100)

      expect(step2Id).toBe(project.value.steps[1]!.id)
      expect(project.value.steps).toHaveLength(2)
      expect(project.value.connections).toHaveLength(1)
      expect(project.value.connections[0]!.source).toBe('step1Id')
      expect(project.value.connections[0]!.target).toBe(step2Id)
    })
  })

  describe('updateContent', () => {
    it('updates content and lastModified', async () => {
      const project = ref(
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
      const context = activeProjectContext(project, buildInMemoryProjectStore())

      const newContent = 'Updated content'
      const updatedTime = '2026-01-11T21:00:00Z'
      vi.mocked(now).mockReturnValue(updatedTime)

      context.updateContent('step1Id', newContent)

      await vi.advanceTimersByTimeAsync(SAVE_DEBOUNCE + 100)

      expect(project.value.steps[0]!.content.text).toBe(newContent)
      expect(context.lastSaved.value).toBe(updatedTime)
    })
  })

  describe('addConnection', () => {
    it('adds a connection and updates lastModified', async () => {
      const project = ref(
        buildProjectData({
          steps: [buildStep({ id: 'step1Id' }), buildStep({ id: 'step2Id' })],
          connections: [],
        })
      )
      const context = activeProjectContext(project, buildInMemoryProjectStore())
      context.addConnection('step1Id', 'step2Id')

      await vi.advanceTimersByTimeAsync(SAVE_DEBOUNCE + 100)

      expect(project.value.connections).toHaveLength(1)
      expect(project.value.connections[0]).toEqual({
        id: expect.anything(),
        source: 'step1Id',
        target: 'step2Id',
      })
      expect(context.lastSaved.value).toBe(mockNow)
    })
  })
})
