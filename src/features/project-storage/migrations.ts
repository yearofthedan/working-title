import type { ProjectData } from './types'

export type Migration = (data: unknown) => ProjectData

export const migrations: Record<string, Migration> = {
  '1.0.0': (data) => data as ProjectData,
}

/**
 * Migrates project data through a sequence of versions.
 */
export function migrateProjectData(data: unknown): ProjectData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid project data for migration')
  }

  const rawData = data as { schemaVersion?: string }
  if (!rawData.schemaVersion) {
    throw new Error('Missing schemaVersion in project data')
  }

  // Currently we only have 1.0.0, so no migration logic needed yet
  // When we add 1.1.0, we would iterate through versions
  const migrate = migrations[rawData.schemaVersion]
  if (!migrate) {
    throw new Error(`Unsupported schemaVersion: ${rawData.schemaVersion}`)
  }

  return migrate(data)
}
