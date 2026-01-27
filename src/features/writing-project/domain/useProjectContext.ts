import { computed, inject, provide, type Ref, type InjectionKey } from 'vue'
import type { ProjectData, Step, Connection } from '../storage/types'
import { generateId } from '@/utils/ids'
import { now } from '@/utils/dates'

export interface ContentItem {
  id: string
  stepId: string
  content: { text: string }
}

export interface ProjectContext {
  steps: Ref<Step[]>
  connections: Ref<Connection[]>
  contentMap: Ref<Map<string, ContentItem>>

  getContent: (id: string) => ContentItem | undefined
  getStep: (id: string) => Step | undefined

  updateContent: (id: string, content: string) => void
  addStep: (stepId: string, sourceStepId?: string) => string
  addConnection: (sourceId: string, targetId: string) => void
}

export const PROJECT_CONTEXT_KEY: InjectionKey<ProjectContext> = Symbol('projectContext')

export function projectContext(projectData: Ref<ProjectData>): ProjectContext {
  const steps = computed(() => projectData.value.steps)
  const connections = computed(() => projectData.value.connections)

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

  const getContent = (id: string) => contentMap.value.get(id)

  const getStep = (id: string) => projectData.value.steps.find((s) => s.id === id)

  const updateLastModified = () => {
    projectData.value.meta.lastModified = now()
  }

  const addStep = (stepId: string, sourceStepId?: string): string => {
    const newStep: Step = {
      id: generateId(),
      stepId,
      content: {
        text: '',
      },
    }

    projectData.value.steps.push(newStep)

    if (sourceStepId) {
      addConnection(sourceStepId, newStep.id)
    }

    updateLastModified()
    return newStep.id
  }

  const updateStepContent = (id: string, content: string) => {
    const step = projectData.value.steps.find((s) => s.id === id)
    if (step) {
      step.content.text = content
      updateLastModified()
    }
  }

  const addConnection = (source: string, target: string) => {
    const newConnection: Connection = {
      id: generateId(),
      source,
      target,
    }

    projectData.value.connections.push(newConnection)
    updateLastModified()
  }

  const context: ProjectContext = {
    steps,
    connections,
    contentMap,
    getContent,
    getStep,
    updateContent: updateStepContent,
    addStep: addStep,
    addConnection: addConnection,
  }

  return context
}

export function provideProjectContext(projectData: Ref<ProjectData>) {
  provide(PROJECT_CONTEXT_KEY, projectContext(projectData))
}

export function useProjectContext(): ProjectContext {
  const context = inject(PROJECT_CONTEXT_KEY)

  if (!context) {
    throw new Error('useProjectContext must be used within provideProjectContext')
  }

  return context
}

export function useProjectContent() {
  const ctx = useProjectContext()
  return {
    contentMap: ctx.contentMap,
    getContent: ctx.getContent,
    updateContent: ctx.updateContent,
  }
}

export function useProjectMutations() {
  const ctx = useProjectContext()
  return {
    addStep: ctx.addStep,
    addConnection: ctx.addConnection,
    updateContent: ctx.updateContent,
  }
}

export function useProjectSteps() {
  const ctx = useProjectContext()
  return {
    steps: ctx.steps,
    connections: ctx.connections,
  }
}
