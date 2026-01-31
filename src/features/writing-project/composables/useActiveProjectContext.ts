import { computed, inject, provide, type Ref, type InjectionKey } from 'vue'
import type { ProjectData, Step, Connection } from '../../project-storage/types'
import { generateId } from '@/utils/ids'
import { useAsyncState, type AsyncStatus } from '@/composables/useAsyncState'
import { watchDebounced } from '@vueuse/core'
import { useProjectStore } from '@/features/project-storage/context'
import type { ProjectStore } from '@/features/project-storage/store'

export const SAVE_DEBOUNCE = 2000
export interface ContentItem {
  id: string
  stepId: string
  content: { text: string }
}

export interface ProjectContext {
  projectName: Ref<string>
  steps: Ref<Step[]>
  connections: Ref<Connection[]>
  contentMap: Ref<Map<string, ContentItem>>

  getContent: (id: string) => ContentItem | undefined
  getStep: (id: string) => Step | undefined

  updateContent: (id: string, content: string) => void
  addStep: (stepId: string, sourceStepId?: string) => string
  addConnection: (sourceId: string, targetId: string) => void

  saveStatus: Ref<AsyncStatus>
  saveError: Ref<Error | null>
  lastSaved: Ref<string | null>
}

export const ACTIVE_PROJECT_CONTEXT_KEY: InjectionKey<ProjectContext> =
  Symbol('activeProjectContext')

export function activeProjectContext(
  projectData: Ref<ProjectData>,
  store?: ProjectStore
): ProjectContext {
  const projectStore = store || useProjectStore()
  const { updateProject } = projectStore
  const {
    state: saveState,
    lastSuccess: lastSaved,
    execute: save,
  } = useAsyncState(async () => {
    await updateProject(projectData.value)
  })

  watchDebounced(
    projectData,
    () => {
      if (projectData.value.projectId !== 'demo') {
        save()
      }
    },
    { deep: true, debounce: SAVE_DEBOUNCE }
  )

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

    return newStep.id
  }

  const updateStepContent = (id: string, content: string) => {
    const step = projectData.value.steps.find((s) => s.id === id)
    if (step) {
      step.content.text = content
    }
  }

  const addConnection = (source: string, target: string) => {
    const newConnection: Connection = {
      id: generateId(),
      source,
      target,
    }

    projectData.value.connections.push(newConnection)
  }

  return {
    projectName: computed(() => projectData.value.meta.name),
    steps,
    connections,
    contentMap,
    getContent: (id) => contentMap.value.get(id),
    getStep: (id) => projectData.value.steps.find((s) => s.id === id),
    updateContent: updateStepContent,
    addStep,
    addConnection,
    saveStatus: computed(() => saveState.value.status),
    saveError: computed(() => saveState.value.error),
    lastSaved,
  }
}

export function provideActiveProjectContext(projectData: Ref<ProjectData>) {
  provide(ACTIVE_PROJECT_CONTEXT_KEY, activeProjectContext(projectData))
}

export function useActiveProjectContext(): ProjectContext {
  const context = inject(ACTIVE_PROJECT_CONTEXT_KEY)

  if (!context) {
    throw new Error('useProjectContext must be used within provideProjectContext')
  }

  return context
}

export function useProjectContent() {
  const ctx = useActiveProjectContext()
  return {
    contentMap: ctx.contentMap,
    getContent: ctx.getContent,
    updateContent: ctx.updateContent,
  }
}

export function useProjectMutations() {
  const ctx = useActiveProjectContext()
  return {
    addStep: ctx.addStep,
    addConnection: ctx.addConnection,
    updateContent: ctx.updateContent,
  }
}

export function useProjectSteps() {
  const ctx = useActiveProjectContext()
  return {
    steps: ctx.steps,
    connections: ctx.connections,
  }
}
