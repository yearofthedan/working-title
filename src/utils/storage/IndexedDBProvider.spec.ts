import { describe, it, expect, beforeEach } from 'vitest'
import { IndexedDBProvider, type IndexedDBConfig } from './IndexedDBProvider'

describe('IndexedDBProvider', () => {
  let provider: IndexedDBProvider

  const testConfig: IndexedDBConfig = {
    dbName: 'test-db-generic',
    version: 1,
    storeNames: ['test-store', 'other-store'],
    defaultStoreName: 'test-store',
  }

  beforeEach(async () => {
    provider = new IndexedDBProvider(testConfig)
    await provider.clear()
  })

  describe('setItem and getItem', () => {
    it('stores and retrieves a value', async () => {
      const key = 'test-key'
      const value = 'test-value'

      await provider.setItem(key, value)
      const retrieved = await provider.getItem<string>(key)

      expect(retrieved).toBe(value)
    })

    it('returns null for non-existent key', async () => {
      const retrieved = await provider.getItem<string>('non-existent')
      expect(retrieved).toBeNull()
    })

    it('overwrites existing value', async () => {
      const key = 'test-key'

      await provider.setItem(key, 'first-value')
      await provider.setItem(key, 'second-value')

      const retrieved = await provider.getItem<string>(key)
      expect(retrieved).toBe('second-value')
    })

    it('handles JSON strings', async () => {
      const key = 'json-key'
      const value = JSON.stringify({ name: 'Test Project', id: 123 })

      await provider.setItem(key, value)
      const retrieved = await provider.getItem<string>(key)

      expect(retrieved).toBe(value)
      expect(JSON.parse(retrieved as string)).toEqual({ name: 'Test Project', id: 123 })
    })

    it('handles empty strings', async () => {
      const key = 'empty-key'
      await provider.setItem(key, '')

      const retrieved = await provider.getItem<string>(key)
      expect(retrieved).toBe('')
    })
  })

  describe('removeItem', () => {
    it('removes an existing item', async () => {
      const key = 'test-key-remove'

      await provider.setItem(key, 'test-value')
      await provider.removeItem(key)

      const retrieved = await provider.getItem<string>(key)
      expect(retrieved).toBeNull()
    })
  })

  describe('clear', () => {
    it('clears all specified stores', async () => {
      await provider.setItem('key1', 'value1', 'test-store')
      await provider.setItem('key2', 'value2', 'other-store')

      await provider.clear()

      expect(await provider.getItem('key1', 'test-store')).toBeNull()
      expect(await provider.getItem('key2', 'other-store')).toBeNull()
    })

    it('clears only a specific store if requested', async () => {
      await provider.setItem('key1', 'value1', 'test-store')
      await provider.setItem('key2', 'value2', 'other-store')

      await provider.clear('test-store')

      expect(await provider.getItem('key1', 'test-store')).toBeNull()
      expect(await provider.getItem('key2', 'other-store')).toBe('value2')
    })
  })
})
