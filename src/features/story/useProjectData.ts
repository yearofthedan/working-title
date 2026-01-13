import { ref } from 'vue'
import type { ProjectData } from '@/specs/projectDataSpec'
import { now } from '@/utils/dates'
import { strings } from '@/features/process-templates/snowflake/strings'
import { template } from '@/features/process-templates/snowflake/template'

const createNewProject = (): ProjectData => {
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
  const projectData = ref<ProjectData>(createNewProject())
  return { project: projectData, template: template, strings: strings }
}
