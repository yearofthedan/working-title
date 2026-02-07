export class DummyFileHandle implements FileSystemFileHandle {
  private dummyName: string
  private fileStore: Map<string, string>

  kind = 'file' as const
  constructor(name: string, fileStore: Map<string, string>) {
    this.dummyName = name
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
    return true
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
