import { describe, expect, beforeEach } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'
import { IndexedDBProvider, type IndexedDBConfig } from './IndexedDBProvider'

describe('IndexedDBProvider', () => {
  let provider: IndexedDBProvider

  const testConfig: IndexedDBConfig = {
    dbName: 'test-db-generic',
    version: 1,
    storeNames: ['test-store', 'other-store'],
  }

  beforeEach(async () => {
    provider = new IndexedDBProvider(testConfig)
    await Promise.all([provider.clear('test-store'), await provider.clear('other-store')])
  })

  describe('setItem and getItem', () => {
    it('stores and retrieves a value', async () => {
      const key = 'test-key'
      const value = 'test-value'

      await provider.setItem(key, value, 'test-store')
      const retrieved = await provider.getItem<string>(key, 'test-store')

      expect(retrieved).toBe(value)
    })

    it('returns empty for non-existent key', async () => {
      const retrieved = await provider.getItem<string>('non-existent', 'test-store')
      expect(retrieved).toBeUndefined()
    })

    it('overwrites existing value', async () => {
      const key = 'test-key'

      await provider.setItem(key, 'first-value', 'test-store')
      await provider.setItem(key, 'second-value', 'test-store')

      const retrieved = await provider.getItem<string>(key, 'test-store')
      expect(retrieved).toBe('second-value')
    })

    it('handles JSON strings', async () => {
      const key = 'json-key'
      const value = JSON.stringify({ name: 'Test Project', id: 123 })

      await provider.setItem(key, value, 'test-store')
      const retrieved = await provider.getItem<string>(key, 'test-store')

      expect(retrieved).toBe(value)
      expect(JSON.parse(retrieved as string)).toEqual({ name: 'Test Project', id: 123 })
    })

    it('handles empty strings', async () => {
      const key = 'empty-key'
      await provider.setItem(key, '', 'test-store')

      const retrieved = await provider.getItem<string>(key, 'test-store')
      expect(retrieved).toBe('')
    })
  })

  describe('removeItem', () => {
    it('removes an existing item', async () => {
      const key = 'test-key-remove'

      await provider.setItem(key, 'test-value', 'test-store')
      await provider.removeItem(key, 'test-store')

      const retrieved = await provider.getItem<string>(key, 'test-store')
      expect(retrieved).toBeUndefined()
    })
  })

  describe('clear', () => {
    it('clears a specific store', async () => {
      await provider.setItem('key1', 'value1', 'test-store')
      await provider.setItem('key2', 'value2', 'other-store')

      await provider.clear('test-store')

      expect(await provider.getItem('key1', 'test-store')).toBeUndefined()
      expect(await provider.getItem('key2', 'other-store')).toBe('value2')
    })
  })
})
