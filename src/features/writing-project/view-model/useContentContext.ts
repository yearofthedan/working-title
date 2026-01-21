import { computed, inject, provide, type Ref, type InjectionKey } from 'vue'
import type { ProjectData, StepContent } from '@/features/writing-project/domain/types'

export interface ContentItem {
  id: string
  stepId: string
  content: StepContent
}

export interface ContentContext {
  /**
   * Read-only map of all content items in the project.
   */
  contentMap: Ref<Map<string, ContentItem>>

  /**
   * Retrieves a specific content item by its ID.
   */
  getContent: (id: string) => ContentItem | undefined

  /**
   * Updates the content for a specific item.
   */
  updateContent: (id: string, content: string) => void
}

export const CONTENT_CONTEXT_KEY: InjectionKey<ContentContext> = Symbol('contentContext')

export function contentContext(
  projectData: Ref<ProjectData>,
  updateStepContent: (id: string, content: string) => void
) {
  const contentMap = computed(() => {
    const map = new Map<string, ContentItem>()

    projectData.value.steps.forEach((step) => {
      map.set(step.id, {
        id: step.id,
        stepId: step.stepId,
        content: step.content,
      })
    })

    return map
  })

  const getContent = (id: string): ContentItem | undefined => {
    return contentMap.value.get(id)
  }

  const updateContent = (id: string, content: string) => {
    updateStepContent(id, content)
  }

  const context: ContentContext = {
    contentMap,
    getContent,
    updateContent,
  }

  return context
}

/**
 * Provider for the Content Context.
 * Should be called at the root of the story canvas.
 */
export function provideContentContext(
  projectData: Ref<ProjectData>,
  updateStepContent: (id: string, content: string) => void
) {
  provide(CONTENT_CONTEXT_KEY, contentContext(projectData, updateStepContent))
}

/**
 * Consumer for the Content Context.
 * Injects the context provided by provideContentContext.
 */
export function useContentContext(): ContentContext {
  const context = inject(CONTENT_CONTEXT_KEY)

  if (!context) {
    throw new Error('useContentContext must be used within provideContentContext')
  }

  return context
}
