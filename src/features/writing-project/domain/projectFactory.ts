import type { ProjectData, Step } from '../storage/types'
import { now } from '@/utils/dates'
import { generateId } from '@/utils/ids'
import type { ProcessTemplate, StepDefinition } from '@/features/process-templates/processTemplate'

export const createNewProject = (template: ProcessTemplate): ProjectData => {
  const created = now()

  const initialSteps: Step[] = template.stepDefinitions
    .filter((def: StepDefinition) => def.isInitial)
    .map((def: StepDefinition) => ({
      id: generateId(),
      stepId: def.id,
      content: {
        text: '',
      },
    }))

  return {
    schemaVersion: '1.0.0',
    projectId: generateId(),
    templateId: template.id,
    templateVersion: template.version,
    meta: {
      name: 'Untitled Story',
      created: created,
      lastModified: created,
    },
    steps: initialSteps,
    connections: [],
  }
}
