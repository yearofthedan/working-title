import type { ProjectData } from '@/features/story/types'
import { migrateProjectData } from './migrations'
import { LocalStorageProvider, type StorageProvider } from '@/utils/storage/StorageProvider'

const APP_NAMESPACE = 'working-title'
const CURRENT_PROJECT_ID_KEY = `${APP_NAMESPACE}:current-project-id`
const PROJECT_PREFIX = `${APP_NAMESPACE}:projects:`

/**
 * Domain-specific storage adapter for project data.
 * Handles serialization, migration, and namespaced keys.
 */
export class ProjectStorage {
  private provider: StorageProvider

  constructor(provider: StorageProvider = new LocalStorageProvider()) {
    this.provider = provider
  }

  save(data: ProjectData): void {
    try {
      const serialized = JSON.stringify(data)
      this.provider.setItem(this.getProjectKey(data.projectId), serialized)
      this.provider.setItem(CURRENT_PROJECT_ID_KEY, data.projectId)
    } catch (err) {
      console.error('Failed to save project to storage:', err)
      throw err instanceof Error ? err : new Error('Unknown save error')
    }
  }

  loadCurrent(): ProjectData | null {
    try {
      const currentId = this.provider.getItem(CURRENT_PROJECT_ID_KEY)
      if (!currentId) return this.loadLegacy() // Check for old single-project key

      return this.loadById(currentId)
    } catch (err) {
      console.error('Failed to load current project from storage:', err)
      return null
    }
  }

  loadById(projectId: string): ProjectData | null {
    try {
      const serialized = this.provider.getItem(this.getProjectKey(projectId))
      if (!serialized) return null

      const raw = JSON.parse(serialized)
      return migrateProjectData(raw)
    } catch (err) {
      console.error(`Failed to load project ${projectId} from storage:`, err)
      return null
    }
  }

  clearCurrent(): void {
    const currentId = this.provider.getItem(CURRENT_PROJECT_ID_KEY)
    if (currentId) {
      this.provider.removeItem(this.getProjectKey(currentId))
      this.provider.removeItem(CURRENT_PROJECT_ID_KEY)
    }
    this.provider.removeItem(`${APP_NAMESPACE}:current-project`) // Cleanup legacy
  }

  private getProjectKey(projectId: string): string {
    return `${PROJECT_PREFIX}${projectId}`
  }

  /**
   * Helper to migrate from the old single-key storage used in initial Phase 1.
   */
  private loadLegacy(): ProjectData | null {
    const legacyKey = `${APP_NAMESPACE}:current-project`
    const serialized = this.provider.getItem(legacyKey)
    if (!serialized) return null

    try {
      const raw = JSON.parse(serialized)
      const project = migrateProjectData(raw)

      // Migrate to new structure immediately if found
      this.save(project)
      this.provider.removeItem(legacyKey)

      return project
    } catch {
      return null
    }
  }
}

export const projectStorage = new ProjectStorage()
