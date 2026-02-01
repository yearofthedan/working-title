import type { ProjectData, ProjectMetadata } from './types'
import { migrateProjectData } from './migrations'
import { IndexedDBProvider, type IndexedDBConfig } from '@/infra/index-db/IndexedDBProvider'
import { type FileSystemFileHandle } from '@/infra/files/types'

const APP_NAMESPACE = 'working-title'
const PROJECT_PREFIX = `${APP_NAMESPACE}:projects:`

export const STORES = {
  CONTENT: 'projectContent',
  REGISTRY: 'projectRegistry',
} as const

export const STORAGE_CONFIG: IndexedDBConfig = {
  dbName: 'working-title-db',
  version: 2,
  storeNames: [STORES.CONTENT, STORES.REGISTRY],
}

/**
 * Domain-specific storage adapter for project data.
 * Handles serialization, migration, and namespaced keys.
 */
export class ProjectStorage {
  private provider: IndexedDBProvider

  constructor(provider: IndexedDBProvider = new IndexedDBProvider(STORAGE_CONFIG)) {
    this.provider = provider
  }
  private isRealHandle(handle: FileSystemFileHandle): handle is FileSystemFileHandle {
    return !('isDummy' in handle && handle.isDummy === true)
  }
  async loadById(projectId: string): Promise<ProjectData> {
    const serialized = await this.provider.getItem<string>(
      this.getProjectKey(projectId),
      STORES.CONTENT
    )

    if (!serialized) {
      throw new Error(
        `Project ${projectId} not found in local storage. This data is irrecoverable.`
      )
    }

    try {
      const raw = JSON.parse(serialized)
      return migrateProjectData(raw)
    } catch {
      throw new Error(`Project ${projectId} exists but is corrupted.`)
    }
  }

  private async getMetadata(projectId: IDBValidKey): Promise<ProjectMetadata | undefined> {
    return await this.provider.getItem<ProjectMetadata>(projectId, STORES.REGISTRY)
  }

  /**
   * Retrieves the file handle associated with a project to be used for file system syncing.
   * Should return a handle, but if it doesn't the consumer should handle reconnecting it.
   */
  async getFileHandle(projectId: string): Promise<FileSystemFileHandle | undefined> {
    const metadata = await this.getMetadata(projectId)
    return metadata?.fileHandle
  }

  /**
   * Lists all projects with their metadata.
   */
  async listProjects(): Promise<ProjectMetadata[]> {
    return await this.provider.getAll<ProjectMetadata>(STORES.REGISTRY)
  }

  /**
   * Internal helper to ensure the registry always reflects the content.
   */
  private async syncRegistry(
    data: ProjectData,
    fileHandle?: FileSystemFileHandle
  ): Promise<ProjectMetadata> {
    const existing = await this.getMetadata(data.projectId)
    const includeHandle = fileHandle && this.isRealHandle(fileHandle)
    const metadata: ProjectMetadata = {
      ...existing,
      id: data.projectId,
      name: data.meta.name,
      templateId: data.templateId,
      createdAt: existing?.createdAt ?? data.meta.created,
      updatedAt: data.meta.lastModified,
      fileHandle: includeHandle ? fileHandle : existing?.fileHandle,
      filePath: includeHandle ? fileHandle?.name : existing?.filePath,
    }
    await this.provider.setItem(data.projectId, metadata, STORES.REGISTRY)
    return metadata
  }

  async save(data: ProjectData, fileHandle?: FileSystemFileHandle): Promise<ProjectMetadata> {
    const serialized = JSON.stringify(data)
    await this.provider.setItem(this.getProjectKey(data.projectId), serialized, STORES.CONTENT)
    return await this.syncRegistry(data, fileHandle)
  }

  async delete(projectId: string): Promise<void> {
    await this.provider.removeItem(this.getProjectKey(projectId), STORES.CONTENT)
    await this.provider.removeItem(projectId, STORES.REGISTRY)
  }

  private getProjectKey(projectId: string): string {
    return `${PROJECT_PREFIX}${projectId}`
  }
}

export const projectStorage = new ProjectStorage()
