import { generateId } from '@/utils/ids'
import { FileSystemStorageProvider } from './FileSystemStorageProvider'
import type { FileSystemFileHandle } from './types'
import { buildProjectData } from '@/features/project-storage/__testHelpers__/builders'

class DummyFileHandle implements FileSystemFileHandle {
  private dummyName: string
  private treatAsReal: boolean
  private fileStore: Map<string, string>

  kind = 'file' as const
  constructor(name: string, fileStore: Map<string, string>, treatAsReal = false) {
    this.dummyName = name
    this.treatAsReal = treatAsReal
    this.fileStore = fileStore
  }

  get name() {
    return this.dummyName
  }

  async getFile() {
    const content = this.fileStore.get(this.dummyName) || '{}'
    return new DummyFile(this.dummyName, content)
  }

  async createWritable() {
    return {
      write: async (data: string): Promise<void> => {
        this.fileStore.set(this.dummyName, data)
        return
      },
      close: async () => {},
    } as FileSystemWritableFileStream
  }

  async queryPermission(): Promise<PermissionState> {
    return 'granted'
  }
  async requestPermission(): Promise<PermissionState> {
    return 'granted'
  }

  async isSameEntry(other: FileSystemHandle): Promise<boolean> {
    return other === this
  }

  get isDummy() {
    return !this.treatAsReal
  }
}

class DummyFile extends File {
  private content: string
  constructor(name: string, content: string) {
    super([], name)
    this.content = content
  }

  async text(): Promise<string> {
    return this.content
  }
}

export class InMemoryStorageProvider extends FileSystemStorageProvider {
  private fileStore = new Map<string, string>()
  // When testing we want to treat the files as real files to check indexdb
  private treatAsReal: boolean
  // Helps to simulate the file load lag for testing
  private delay: number

  constructor(options: { treatAsReal?: boolean; delay?: number } = {}) {
    super()
    this.treatAsReal = options.treatAsReal ?? false
    this.delay = options.delay ?? 0
  }

  async requestNewFileHandle(suggestedName: string): Promise<FileSystemFileHandle> {
    if (!this.fileStore.has(suggestedName)) {
      this.fileStore.set(suggestedName, JSON.stringify(buildProjectData()))
    }
    return new DummyFileHandle(suggestedName, this.fileStore, this.treatAsReal)
  }

  async requestOpenFileHandle(): Promise<FileSystemFileHandle> {
    const name = generateId() + '.json'
    this.fileStore.set(name, JSON.stringify(buildProjectData()))
    await new Promise((resolve) => setTimeout(resolve, this.delay))

    return new DummyFileHandle(name, this.fileStore, this.treatAsReal)
  }
}
