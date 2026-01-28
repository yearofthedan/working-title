import type { StorageProvider } from './StorageProvider'

export interface IndexedDBConfig {
  dbName: string
  version: number
  storeNames: string[]
  defaultStoreName: string
}

/**
 * IndexedDB implementation of StorageProvider.
 * Provides async key-value storage with larger capacity than localStorage.
 */
export class IndexedDBProvider implements StorageProvider {
  private dbPromise: Promise<IDBDatabase>
  private config: IndexedDBConfig

  constructor(config: IndexedDBConfig) {
    this.config = config
    this.dbPromise = this.initDB()
  }

  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version)

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`))
      }

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        this.config.storeNames.forEach((name) => {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name)
          }
        })
      }
    })
  }

  async getItem<T = unknown>(
    key: string,
    storeName: string = this.config.defaultStoreName
  ): Promise<T | null> {
    try {
      const db = await this.dbPromise
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly')
        const store = transaction.objectStore(storeName)
        const request = store.get(key)

        request.onsuccess = () => {
          resolve((request.result as T) ?? null)
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

  async setItem<T = unknown>(
    key: string,
    value: T,
    storeName: string = this.config.defaultStoreName
  ): Promise<void> {
    try {
      const db = await this.dbPromise
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite')
        const store = transaction.objectStore(storeName)
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

  async removeItem(key: string, storeName: string = this.config.defaultStoreName): Promise<void> {
    try {
      const db = await this.dbPromise
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite')
        const store = transaction.objectStore(storeName)
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

  async getAllKeys(storeName: string = this.config.defaultStoreName): Promise<string[]> {
    try {
      const db = await this.dbPromise
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly')
        const store = transaction.objectStore(storeName)
        const request = store.getAllKeys()

        request.onsuccess = () => {
          resolve(request.result as string[])
        }

        request.onerror = () => {
          reject(new Error(`Failed to get all keys: ${request.error?.message}`))
        }
      })
    } catch (err) {
      console.error('IndexedDB getAllKeys error:', err)
      return []
    }
  }

  async clear(storeName?: string): Promise<void> {
    try {
      const db = await this.dbPromise
      const stores = storeName ? [storeName] : this.config.storeNames

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(stores, 'readwrite')

        stores.forEach((name) => {
          if (db.objectStoreNames.contains(name)) {
            transaction.objectStore(name).clear()
          }
        })

        transaction.oncomplete = () => resolve()
        transaction.onerror = () => {
          reject(new Error(`Failed to clear stores: ${transaction.error?.message}`))
        }
      })
    } catch (err) {
      console.error('IndexedDB clear error:', err)
      throw err instanceof Error ? err : new Error('Unknown clear error')
    }
  }
}
