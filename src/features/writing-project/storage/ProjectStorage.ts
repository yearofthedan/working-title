import type { ProjectData, ProjectMetadata } from './types'
import { migrateProjectData } from './migrations'
import type { StorageProvider } from '@/utils/storage/StorageProvider'
import { IndexedDBProvider, type IndexedDBConfig } from '@/utils/storage/IndexedDBProvider'
import { type FileSystemFileHandle } from '@/utils/storage/types'

const APP_NAMESPACE = 'working-title'
const CURRENT_PROJECT_ID_KEY = `${APP_NAMESPACE}:current-project-id`
const PROJECT_PREFIX = `${APP_NAMESPACE}:projects:`

const STORE_NAME = 'keyValueStore'
const METADATA_STORE = 'projectMetadata'

export const STORAGE_CONFIG: IndexedDBConfig = {
  dbName: 'working-title-db',
  version: 2,
  storeNames: [STORE_NAME, METADATA_STORE],
  defaultStoreName: STORE_NAME,
}

/**
 * Domain-specific storage adapter for project data.
 * Handles serialization, migration, and namespaced keys.
 */
export class ProjectStorage {
  private provider: StorageProvider

  constructor(provider: StorageProvider = new IndexedDBProvider(STORAGE_CONFIG)) {
    this.provider = provider
  }

  async save(data: ProjectData): Promise<void> {
    try {
      const serialized = JSON.stringify(data)
      await this.provider.setItem(this.getProjectKey(data.projectId), serialized)
      await this.provider.setItem(CURRENT_PROJECT_ID_KEY, data.projectId)

      // Sync metadata
      await this.updateMetadata(data)
    } catch (err) {
      console.error('Failed to save project to storage:', err)
      throw err instanceof Error ? err : new Error('Unknown save error')
    }
  }

  async loadCurrent(): Promise<ProjectData | null> {
    try {
      const currentId = await this.provider.getItem<string>(CURRENT_PROJECT_ID_KEY)
      if (!currentId) return null

      return await this.loadById(currentId)
    } catch (err) {
      console.error('Failed to load current project from storage:', err)
      return null
    }
  }

  async loadById(projectId: string): Promise<ProjectData | null> {
    try {
      const serialized = await this.provider.getItem<string>(this.getProjectKey(projectId))
      if (!serialized) return null

      const raw = JSON.parse(serialized)
      return migrateProjectData(raw)
    } catch (err) {
      console.error(`Failed to load project ${projectId} from storage:`, err)
      return null
    }
  }

  async clearCurrent(): Promise<void> {
    const currentId = await this.provider.getItem<string>(CURRENT_PROJECT_ID_KEY)
    if (currentId) {
      await this.provider.removeItem(this.getProjectKey(currentId))
      await this.provider.removeItem(CURRENT_PROJECT_ID_KEY)
      await this.provider.removeItem(currentId, METADATA_STORE)
    }
  }

  /**
   * Saves a project along with its file handle.
   */
  async saveProjectWithFileHandle(
    project: ProjectData,
    fileHandle: FileSystemFileHandle
  ): Promise<void> {
    await this.save(project)
    const metadata = await this.getMetadata(project.projectId)
    if (metadata) {
      metadata.fileHandle = fileHandle
      metadata.filePath = fileHandle.name
      await this.provider.setItem(project.projectId, metadata, METADATA_STORE)
    }
  }

  /**
   * Retrieves the file handle associated with a project.
   */
  async getFileHandle(projectId: string): Promise<FileSystemFileHandle | null> {
    const metadata = await this.getMetadata(projectId)
    return (metadata?.fileHandle as FileSystemFileHandle) ?? null
  }

  /**
   * Lists all projects with their metadata.
   */
  async listProjects(): Promise<ProjectMetadata[]> {
    const keys = await this.provider.getAllKeys(METADATA_STORE)
    const projects: ProjectMetadata[] = []

    for (const key of keys) {
      const metadata = await this.getMetadata(key)
      if (metadata) {
        projects.push(metadata)
      }
    }

    return projects
  }

  /**
   * Removes the file handle association for a project.
   */
  async clearFileHandle(projectId: string): Promise<void> {
    const metadata = await this.getMetadata(projectId)
    if (metadata) {
      metadata.fileHandle = undefined
      metadata.filePath = undefined
      await this.provider.setItem(projectId, metadata, METADATA_STORE)
    }
  }

  private async getMetadata(projectId: string): Promise<ProjectMetadata | null> {
    return await this.provider.getItem<ProjectMetadata>(projectId, METADATA_STORE)
  }

  private async updateMetadata(data: ProjectData): Promise<void> {
    const existing = await this.getMetadata(data.projectId)
    const metadata: ProjectMetadata = {
      id: data.projectId,
      name: data.meta.name,
      templateId: data.templateId,
      createdAt: data.meta.created,
      updatedAt: data.meta.lastModified,
      fileHandle: existing?.fileHandle,
      filePath: existing?.filePath,
    }
    await this.provider.setItem(data.projectId, metadata, METADATA_STORE)
  }

  private getProjectKey(projectId: string): string {
    return `${PROJECT_PREFIX}${projectId}`
  }
}

export const projectStorage = new ProjectStorage()
