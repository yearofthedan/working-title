import type { ProjectData } from '@/features/writing-project/domain/types'
import { migrateProjectData } from './migrations'
import type { StorageProvider } from '@/utils/storage/StorageProvider'
import { IndexedDBProvider } from '@/utils/storage/IndexedDBProvider'

const APP_NAMESPACE = 'working-title'
const CURRENT_PROJECT_ID_KEY = `${APP_NAMESPACE}:current-project-id`
const PROJECT_PREFIX = `${APP_NAMESPACE}:projects:`

/**
 * Domain-specific storage adapter for project data.
 * Handles serialization, migration, and namespaced keys.
 */
export class ProjectStorage {
  private provider: StorageProvider

  constructor(provider: StorageProvider = new IndexedDBProvider()) {
    this.provider = provider
  }

  async save(data: ProjectData): Promise<void> {
    try {
      const serialized = JSON.stringify(data)
      await this.provider.setItem(this.getProjectKey(data.projectId), serialized)
      await this.provider.setItem(CURRENT_PROJECT_ID_KEY, data.projectId)
    } catch (err) {
      console.error('Failed to save project to storage:', err)
      throw err instanceof Error ? err : new Error('Unknown save error')
    }
  }

  async loadCurrent(): Promise<ProjectData | null> {
    try {
      const currentId = await this.provider.getItem(CURRENT_PROJECT_ID_KEY)
      if (!currentId) return null

      return await this.loadById(currentId)
    } catch (err) {
      console.error('Failed to load current project from storage:', err)
      return null
    }
  }

  async loadById(projectId: string): Promise<ProjectData | null> {
    try {
      const serialized = await this.provider.getItem(this.getProjectKey(projectId))
      if (!serialized) return null

      const raw = JSON.parse(serialized)
      return migrateProjectData(raw)
    } catch (err) {
      console.error(`Failed to load project ${projectId} from storage:`, err)
      return null
    }
  }

  async clearCurrent(): Promise<void> {
    const currentId = await this.provider.getItem(CURRENT_PROJECT_ID_KEY)
    if (currentId) {
      await this.provider.removeItem(this.getProjectKey(currentId))
      await this.provider.removeItem(CURRENT_PROJECT_ID_KEY)
    }
  }

  private getProjectKey(projectId: string): string {
    return `${PROJECT_PREFIX}${projectId}`
  }
}

export const projectStorage = new ProjectStorage()
