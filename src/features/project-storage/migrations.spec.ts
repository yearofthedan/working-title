import { describe, expect } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'
import { migrateProjectData } from './migrations'
import { buildProjectData } from './__testHelpers__/builders'

describe('migrateProjectData', () => {
  it('returns data as is for version 1.0.0', () => {
    const data = buildProjectData({ schemaVersion: '1.0.0' })
    const migrated = migrateProjectData(data)
    expect(migrated).toEqual(data)
  })

  it('throws error if data is null', () => {
    expect(() => migrateProjectData(null)).toThrow('Invalid project data for migration')
  })

  it('throws error if data is not an object', () => {
    expect(() => migrateProjectData('not-an-object')).toThrow('Invalid project data for migration')
  })

  it('throws error if schemaVersion is missing', () => {
    const data = { some: 'data' }
    expect(() => migrateProjectData(data)).toThrow('Missing schemaVersion in project data')
  })

  it('throws error for unsupported schemaVersion', () => {
    const data = { schemaVersion: '9.9.9' }
    expect(() => migrateProjectData(data)).toThrow('Unsupported schemaVersion: 9.9.9')
  })
})
