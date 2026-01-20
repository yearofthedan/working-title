import { describe, it, expect, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { contentContext } from './useContentContext'
import { buildProjectData, buildStep } from '@/features/story/__testHelpers__/builders'

describe('useContentContext', () => {
  it('maps the content map from the project data', () => {
    const projectData = ref(
      buildProjectData({
        steps: [
          buildStep({ id: 's1', content: { text: 'Content 1' } }),
          buildStep({ id: 's2', content: { text: 'Content 2' } }),
        ],
      })
    )
    const updateFn = vi.fn()

    const context = contentContext(projectData, updateFn)

    expect(context.contentMap.value.size).toBe(2)
    expect(context.getContent('s1')?.content.text).toBe('Content 1')

    context.updateContent('s1', 'New Content')
    expect(updateFn).toHaveBeenCalledWith('s1', 'New Content')
  })

  it('reacts to project data changes', async () => {
    const projectData = ref(
      buildProjectData({
        steps: [
          buildStep({ id: 's1', content: { text: 'Content 1' } }),
          buildStep({ id: 's2', content: { text: 'Content 2' } }),
        ],
      })
    )
    const updateFn = vi.fn()

    const context = contentContext(projectData, updateFn)

    expect(context.contentMap.value.size).toBe(2)

    projectData.value = {
      ...projectData.value,
      steps: [...projectData.value.steps, buildStep({ id: 's3', content: { text: 'Content 3' } })],
    }
    await nextTick()

    expect(context.contentMap.value.size).toBe(3)
    expect(context.getContent('s3')?.content.text).toBe('Content 3')
  })
})
