export interface IndexedDBConfig {
  dbName: string
  version: number
  storeNames: string[]
}

export class IndexedDBProvider {
  private dbPromise: Promise<IDBDatabase>
  private config: IndexedDBConfig

  constructor(config: IndexedDBConfig) {
    this.config = config
    this.dbPromise = this.initDB()
  }

  private async wrapRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  private async execute<T>(
    storeName: string,
    mode: IDBTransactionMode,
    task: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    try {
      const db = await this.dbPromise
      const transaction = db.transaction(storeName, mode)
      const store = transaction.objectStore(storeName)
      const request = task(store)

      return await this.wrapRequest(request)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown IndexedDB error'
      throw new Error(`IndexedDB Operation Failed in ${storeName}: ${message}`)
    }
  }

  async getItem<T = unknown>(key: IDBValidKey, storeName: string): Promise<T | undefined> {
    return await this.execute(storeName, 'readonly', (store) => store.get(key))
  }

  async setItem<T = unknown>(key: IDBValidKey, value: T, storeName: string): Promise<void> {
    await this.execute(storeName, 'readwrite', (store) => store.put(value, key))
  }

  async removeItem(key: IDBValidKey, storeName: string): Promise<void> {
    await this.execute(storeName, 'readwrite', (store) => store.delete(key))
  }

  async getAllKeys(storeName: string): Promise<IDBValidKey[]> {
    return await this.execute(storeName, 'readonly', (store) => store.getAllKeys())
  }

  async getAll<T = unknown>(storeName: string): Promise<T[]> {
    return await this.execute<T[]>(storeName, 'readonly', (store) => store.getAll())
  }

  async clear(storeName: string): Promise<void> {
    await this.execute<undefined>(storeName, 'readwrite', (store) => store.clear())
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

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Remove stores that are no longer in config
        Array.from(db.objectStoreNames).forEach((existingName) => {
          if (!this.config.storeNames.includes(existingName)) {
            db.deleteObjectStore(existingName)
          }
        })

        // Add new stores from config
        this.config.storeNames.forEach((name) => {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name)
          }
        })
      }
    })
  }
}
