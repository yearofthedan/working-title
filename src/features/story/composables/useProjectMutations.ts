import type { Ref } from 'vue'
import type { ProjectData, Step, Connection } from '@/specs/projectDataSpec'
import { generateId } from '@/utils/ids'
import { now } from '@/utils/dates'

export interface ProjectMutations {
  addStep: (stepId: string, sourceStepId?: string) => void
  updateStepContent: (id: string, content: string) => void
  addConnection: (sourceId: string, targetId: string) => void
}

export const useProjectMutations = (project: Ref<ProjectData>): ProjectMutations => {
  const updateLastModified = () => {
    project.value.meta.lastModified = now()
  }

  const addStep = (stepId: string, sourceStepId?: string) => {
    const newStep: Step = {
      id: generateId(),
      stepId,
      content: {
        text: '',
      },
    }

    project.value.steps.push(newStep)

    if (sourceStepId) {
      addConnection(sourceStepId, newStep.id)
    }

    updateLastModified()
  }

  const updateStepContent = (id: string, content: string) => {
    const step = project.value.steps.find((s) => s.id === id)
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

    project.value.connections.push(newConnection)
    updateLastModified()
  }

  return {
    addStep,
    updateStepContent,
    addConnection,
  }
}
