export class DummyFileHandle implements FileSystemFileHandle {
  private dummyName: string
  private fileStore: Map<string, string>

  kind = 'file' as const
  constructor(name: string, fileStore: Map<string, string>) {
    this.dummyName = name
    this.fileStore = fileStore
    this.isFile = true
    this.isDirectory = false
  }
  isFile: true
  isDirectory: false

  get name() {
    return this.dummyName
  }

  async getFile() {
    const content = this.fileStore.get(this.dummyName) || '{}'
    return Promise.resolve(new DummyFile(this.dummyName, content))
  }

  async createWritable() {
    return Promise.resolve({
      write: async (data: string): Promise<void> => {
        this.fileStore.set(this.dummyName, data)
        return Promise.resolve()
      },
      close: async () => {},
    } as FileSystemWritableFileStream)
  }

  async queryPermission(): Promise<PermissionState> {
    return Promise.resolve('granted')
  }
  async requestPermission(): Promise<PermissionState> {
    return Promise.resolve('granted')
  }

  async isSameEntry(other: FileSystemHandle): Promise<boolean> {
    return Promise.resolve(other === this)
  }

  get isDummy() {
    return true
  }
}

export class DummyDirectoryHandle implements FileSystemDirectoryHandle {
  kind = 'directory' as const
  private dummyName: string
  private fileStore: Map<string, string>

  constructor(name: string, fileStore: Map<string, string>) {
    this.dummyName = name
    this.fileStore = fileStore
    this.isFile = false
    this.isDirectory = true
  }
  [Symbol.asyncIterator](): AsyncIterableIterator<
    [string, FileSystemDirectoryHandle | FileSystemFileHandle]
  > {
    throw new Error('Method not implemented.')
  }

  isFile: false
  isDirectory: true

  removeEntry(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  resolve(): Promise<string[] | null> {
    throw new Error('Method not implemented.')
  }
  keys(): AsyncIterableIterator<string> {
    throw new Error('Method not implemented.')
  }
  values(): AsyncIterableIterator<FileSystemDirectoryHandle | FileSystemFileHandle> {
    throw new Error('Method not implemented.')
  }
  entries(): AsyncIterableIterator<[string, FileSystemDirectoryHandle | FileSystemFileHandle]> {
    throw new Error('Method not implemented.')
  }

  getFile(): Promise<FileSystemFileHandle> {
    throw new Error('Method not implemented.')
  }

  getDirectory(): Promise<FileSystemDirectoryHandle> {
    throw new Error('Method not implemented.')
  }

  getEntries(): AsyncIterableIterator<FileSystemDirectoryHandle | FileSystemFileHandle> {
    throw new Error('Method not implemented.')
  }

  get name() {
    return this.dummyName
  }

  async getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle> {
    if (!this.fileStore.has(name) && !options?.create) {
      throw new Error(`File ${name} not found`)
    }
    return Promise.resolve(new DummyFileHandle(name, this.fileStore))
  }

  async getDirectoryHandle(
    name: string,
    options?: { create?: boolean }
  ): Promise<FileSystemDirectoryHandle> {
    console.debug('DummyDirectoryHandle.getDirectoryHandle', name, options)
    return Promise.resolve(new DummyDirectoryHandle(name, this.fileStore))
  }

  async queryPermission(): Promise<PermissionState> {
    return Promise.resolve('granted')
  }

  async requestPermission(): Promise<PermissionState> {
    return Promise.resolve('granted')
  }

  async isSameEntry(other: FileSystemHandle): Promise<boolean> {
    return Promise.resolve(other === this)
  }
}

class DummyFile extends File {
  private content: string
  constructor(name: string, content: string) {
    super([], name)
    this.content = content
  }

  async text(): Promise<string> {
    return Promise.resolve(this.content)
  }
}
