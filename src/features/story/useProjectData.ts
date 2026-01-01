import { ref } from 'vue'
import type { Project } from '@features/shared/dataSpec'
import { now } from '@/utils/dates'
import { strings } from '../snowflake/strings'
import { template } from '../snowflake/template'

const createNewProject = (): Project => {
  const created = now()
  return {
    schemaVersion: '1.0.0',
    projectId: 'PLACE_HOLDER_PROJECT_ID',
    templateId: 'snowflake-method-v1',
    templateVersion: '1.0.0',
    meta: {
      name: 'PLACEHOLDER_PROJECT_NAME',
      created: created,
      lastModified: created,
    },
    steps: [],
    connections: [],
  }
}

export const useProjectData = () => {
  const projectData = ref<Project>(createNewProject())
  return { project: projectData, template: template, strings: strings }
}
