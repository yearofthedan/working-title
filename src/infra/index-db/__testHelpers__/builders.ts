import { type IIndexedDBProvider } from '../IndexedDBProvider'

export class InMemoryIndexedDBProvider implements IIndexedDBProvider {
  private stores = new Map<string, Map<IDBValidKey, unknown>>()

  constructor(config?: { storeNames: string[] }) {
    config?.storeNames.forEach((name) => {
      this.stores.set(name, new Map())
    })
  }

  private getStore(name: string): Map<IDBValidKey, unknown> {
    if (!this.stores.has(name)) {
      this.stores.set(name, new Map())
    }
    return this.stores.get(name)!
  }

  async getItem<T = unknown>(key: IDBValidKey, storeName: string): Promise<T | undefined> {
    const store = this.getStore(storeName)
    return (store.get(key) as T) || undefined
  }

  async setItem<T = unknown>(key: IDBValidKey, value: T, storeName: string): Promise<void> {
    const store = this.getStore(storeName)
    store.set(key, value)
  }

  async removeItem(key: IDBValidKey, storeName: string): Promise<void> {
    const store = this.getStore(storeName)
    store.delete(key)
  }

  async getAll<T = unknown>(storeName: string): Promise<T[]> {
    const store = this.getStore(storeName)
    return Array.from(store.values()) as T[]
  }
}
