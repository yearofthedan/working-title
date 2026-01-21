import type { StorageProvider } from './StorageProvider'

const DB_NAME = 'working-title-db'
const DB_VERSION = 1
const STORE_NAME = 'keyValueStore'

/**
 * IndexedDB implementation of StorageProvider.
 * Provides async key-value storage with larger capacity than localStorage.
 */
export class IndexedDBProvider implements StorageProvider {
  private dbPromise: Promise<IDBDatabase>

  constructor() {
    this.dbPromise = this.initDB()
  }

  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`))
      }

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      }
    })
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const db = await this.dbPromise
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.get(key)

        request.onsuccess = () => {
          resolve(request.result ?? null)
        }

        request.onerror = () => {
          reject(new Error(`Failed to get item: ${request.error?.message}`))
        }
      })
    } catch (err) {
      console.error('IndexedDB getItem error:', err)
      return null
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      const db = await this.dbPromise
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.put(value, key)

        request.onsuccess = () => {
          resolve()
        }

        request.onerror = () => {
          reject(new Error(`Failed to set item: ${request.error?.message}`))
        }
      })
    } catch (err) {
      console.error('IndexedDB setItem error:', err)
      throw err instanceof Error ? err : new Error('Unknown setItem error')
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const db = await this.dbPromise
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.delete(key)

        request.onsuccess = () => {
          resolve()
        }

        request.onerror = () => {
          reject(new Error(`Failed to remove item: ${request.error?.message}`))
        }
      })
    } catch (err) {
      console.error('IndexedDB removeItem error:', err)
      throw err instanceof Error ? err : new Error('Unknown removeItem error')
    }
  }
}
