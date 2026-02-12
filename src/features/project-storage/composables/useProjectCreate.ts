import { useAsyncState } from '@/composables/useAsyncState'
import type { ProcessTemplate, StepDefinition } from '@/features/process-templates/processTemplate'
import { loadTemplate } from '@/features/process-templates/templateRegistry'
import { ProjectStorage } from '@/features/project-storage/ProjectStorage'
import { generateId } from '@/utils/ids'
import type { ProjectData, Step } from '../types'
import { now } from '@/utils/dates'
import type { FileSystemStorageProvider } from '@/infra/files/FileSystemStorageProvider'

const projectBase = (template: ProcessTemplate, name: string): ProjectData => {
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
      name: name,
      created: created,
      lastModified: created,
    },
    steps: initialSteps,
    connections: [],
  }
}

export function useProjectCreate(storage: ProjectStorage, fileSystem: FileSystemStorageProvider) {
  const {
    state,
    execute: createProject,
    lastSuccess,
    onSuccess,
    onError,
  } = useAsyncState(
    async (
      projectName: string,
      templateKey: string = 'snowflake-method-v1',
      mode: 'file' | 'directory' = 'directory'
    ) => {
      const { template } = await loadTemplate(templateKey)
      if (!template) throw new Error(`Template ${templateKey} not found`)

      const newProject = projectBase(template, projectName)

      if (mode === 'directory') {
        const parentDir = await fileSystem.requestDirectoryHandle()
        const projectDir = await parentDir.getDirectoryHandle(`${projectName}.narrative`, {
          create: true,
        })
        await fileSystem.writeJsonToDirectory(projectDir, 'project.wt', newProject)
        return await storage.save(newProject, undefined, projectDir)
      }

      const handle = await fileSystem.requestNewFileHandle(`${projectName}.json`)
      await fileSystem.writeAsJson(handle, newProject)

      return await storage.save(newProject, handle)
    }
  )

  return {
    createProject,
    state,
    lastSuccess,
    onSuccess,
    onError,
  }
}
