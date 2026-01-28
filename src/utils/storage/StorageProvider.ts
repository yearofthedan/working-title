export interface StorageProvider {
  getItem<T = unknown>(key: string, storeName?: string): Promise<T | null>
  setItem<T = unknown>(key: string, value: T, storeName?: string): Promise<void>
  removeItem(key: string, storeName?: string): Promise<void>
  getAllKeys(storeName?: string): Promise<string[]>
  clear(storeName?: string): Promise<void>
}

export class LocalStorageProvider implements StorageProvider {
  async getItem<T = unknown>(key: string): Promise<T | null> {
    return localStorage.getItem(key) as unknown as T
  }

  async setItem<T = unknown>(key: string, value: T): Promise<void> {
    localStorage.setItem(key, String(value))
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key)
  }

  async getAllKeys(): Promise<string[]> {
    return Object.keys(localStorage)
  }

  async clear(): Promise<void> {
    localStorage.clear()
  }
}
