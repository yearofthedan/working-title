import type { ProcessTemplate } from '@/features/process-templates/processTemplate'
import { loadTemplate, loadTemplateLocales } from '@/features/process-templates/templateRegistry'
import { projectStorage } from '../../project-storage/ProjectStorage'
import type { ProjectData } from '../../project-storage/types'
import { registerTemplateMessages } from '@/i18n'
import { useAsyncState } from '@/composables/useAsyncState'
import { toValue, watch, type MaybeRefOrGetter } from 'vue'
import { logError } from '@/infra/logging/globals'

export type Project = { data: ProjectData; template: ProcessTemplate }

const loadProject = async (projectId: string): Promise<Project> => {
  try {
    const projectData = await projectStorage.loadById(projectId)

    if (!projectData) {
      throw new Error('PROJECT_NOT_FOUND')
    }

    const templateId = projectData.templateId
    const [templateModule, locales] = await Promise.all([
      loadTemplate(templateId),
      loadTemplateLocales(templateId),
    ])

    Object.entries(locales).forEach(([locale, messages]) => {
      registerTemplateMessages(templateId, locale, messages)
    })

    return { data: projectData, template: templateModule.template }
  } catch (err) {
    logError('Failed to load project', { projectId, originalError: err })
    throw err
  }
}

export function useProjectLoader(projectId: MaybeRefOrGetter<string>) {
  const { state, execute } = useAsyncState((id: string) => loadProject(id))

  watch(
    () => toValue(projectId),
    (id) => {
      if (id) execute(id)
    },
    { immediate: true }
  )

  return { state, reload: execute }
}
