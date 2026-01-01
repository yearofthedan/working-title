import { ref } from 'vue'
import type { StoryProject } from '../shared/dataSpec'
import { now } from '@/utils/dates'
import { strings } from '../snowflake/strings'
import { template } from '../snowflake/template'

const createNewProject = (): StoryProject => {
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
    nodes: [],
    edges: [],
  }
}

export const useProjectData = () => {
  const projectData = ref<StoryProject>(createNewProject())
  return { data: projectData, template: template, strings: strings }
}
