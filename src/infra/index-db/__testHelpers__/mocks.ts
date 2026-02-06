import { vi } from 'vitest'
import { IndexedDBProvider } from '../IndexedDBProvider'

export const buildMockIndexedDBProvider = (): IndexedDBProvider =>
  ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    getAll: vi.fn(),
  }) as unknown as IndexedDBProvider
