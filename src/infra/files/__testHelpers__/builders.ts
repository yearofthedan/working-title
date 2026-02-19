import { FallbackFileStorageProvider } from '../FallbackFileStorageProvider'
import { DummyFileHandle, DummyDirectoryHandle } from '../DummyFileHandle'
import { vi } from 'vitest'

import { buildProjectData } from '@/features/project-storage/__testHelpers__/builders'
import { generateId } from '@/utils/ids'

class TestFileHandle extends DummyFileHandle {
  // In test env we care that the handle is saved to indexdb.
  get isDummy() {
    return false
  }
}

class TestDirectoryHandle extends DummyDirectoryHandle {
  get isDummy() {
    return false
  }
}

/**
 * Mock FileSystemFileHandle for testing
 */
export function buildMockFileHandle(
  name: string,
  content: unknown,
  onWrite?: (data: unknown) => void
): FileSystemFileHandle {
  let currentContent = content
  return {
    kind: 'file',
    name,
    getFile: vi.fn(async () => ({
      text: vi.fn(async () =>
        typeof currentContent === 'string' ? currentContent : JSON.stringify(currentContent)
      ),
    })),
    createWritable: vi.fn(async () => {
      return {
        write: vi.fn(async (data) => {
          currentContent = data
          if (onWrite) onWrite(data)
        }),
        close: vi.fn(async () => {
          // In a real mock we might update the content source
        }),
      }
    }),
    queryPermission: vi.fn(async () => Promise.resolve('granted')),
    requestPermission: vi.fn(async () => Promise.resolve('granted')),
    isSameEntry: vi.fn(async () => false),
  } as unknown as FileSystemFileHandle
}

/**
 * Mock FileSystemDirectoryHandle for testing
 */
export function buildMockDirectoryHandle(
  name: string = 'test-project.narrative',
  files: Map<string, unknown> = new Map()
): FileSystemDirectoryHandle {
  return {
    kind: 'directory',
    name,
    getFileHandle: vi.fn(async (fileName: string, options: { create?: boolean }) => {
      if (files.has(fileName)) {
        return buildMockFileHandle(fileName, files.get(fileName), (data) =>
          files.set(fileName, data)
        )
      }
      if (options?.create) {
        const handle = buildMockFileHandle(fileName, {}, (data) => files.set(fileName, data))
        files.set(fileName, handle) // Initial set
        return Promise.resolve(handle)
      }
      throw new Error(`File not found: ${fileName}`)
    }),
    getDirectoryHandle: vi.fn(async (dirName: string, options: { create?: boolean }) => {
      if (options?.create) {
        return Promise.resolve(buildMockDirectoryHandle(dirName))
      }
      throw new Error(`Directory not found: ${dirName}`)
    }),
    queryPermission: vi.fn(async () => 'granted'),
    requestPermission: vi.fn(async () => 'granted'),
    isSameEntry: vi.fn(async () => false),
  } as unknown as FileSystemDirectoryHandle
}

/**
 * Mock window.showDirectoryPicker for tests
 */
export function mockDirectoryPicker(returnHandle?: FileSystemDirectoryHandle) {
  const handle = returnHandle ?? buildMockDirectoryHandle()
  vi.stubGlobal(
    'showDirectoryPicker',
    vi.fn(async () => handle)
  )
  return handle
}

export class TestFileStorageProvider extends FallbackFileStorageProvider {
  private loadDelay: number

  constructor(loadDelay = 0) {
    super()
    this.loadDelay = loadDelay
  }

  async requestNewFileHandle(suggestedName: string): Promise<FileSystemFileHandle> {
    if (!this.fileStore.has(suggestedName)) {
      this.fileStore.set(suggestedName, JSON.stringify(buildProjectData()))
    }
    return new TestFileHandle(suggestedName, this.fileStore)
  }

  async requestOpenFileHandle(): Promise<FileSystemFileHandle> {
    const name = generateId() + '.json'
    this.fileStore.set(name, JSON.stringify(buildProjectData()))

    return new TestFileHandle(name, this.fileStore)
  }

  async requestDirectoryHandle(): Promise<FileSystemDirectoryHandle> {
    return new TestDirectoryHandle('test-dir', this.fileStore)
  }
}
