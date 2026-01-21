import { describe, it, expect, beforeEach } from 'vitest'
import { IndexedDBProvider } from './IndexedDBProvider'

describe('IndexedDBProvider', () => {
  let provider: IndexedDBProvider

  beforeEach(() => {
    provider = new IndexedDBProvider()
  })

  describe('setItem and getItem', () => {
    it('stores and retrieves a value', async () => {
      const key = 'test-key'
      const value = 'test-value'

      await provider.setItem(key, value)
      const retrieved = await provider.getItem(key)

      expect(retrieved).toBe(value)
    })

    it('returns null for non-existent key', async () => {
      const retrieved = await provider.getItem('non-existent')
      expect(retrieved).toBeNull()
    })

    it('overwrites existing value', async () => {
      const key = 'test-key'

      await provider.setItem(key, 'first-value')
      await provider.setItem(key, 'second-value')

      const retrieved = await provider.getItem(key)
      expect(retrieved).toBe('second-value')
    })

    it('handles JSON strings', async () => {
      const key = 'json-key'
      const value = JSON.stringify({ name: 'Test Project', id: 123 })

      await provider.setItem(key, value)
      const retrieved = await provider.getItem(key)

      expect(retrieved).toBe(value)
      expect(JSON.parse(retrieved!)).toEqual({ name: 'Test Project', id: 123 })
    })

    it('handles empty strings', async () => {
      const key = 'empty-key'
      await provider.setItem(key, '')

      const retrieved = await provider.getItem(key)
      expect(retrieved).toBe('')
    })
  })

  describe('removeItem', () => {
    it('removes an existing item', async () => {
      const key = 'test-key-remove'

      await provider.setItem(key, 'test-value')
      await provider.removeItem(key)

      const retrieved = await provider.getItem(key)
      expect(retrieved).toBeNull()
    })
  })
})
