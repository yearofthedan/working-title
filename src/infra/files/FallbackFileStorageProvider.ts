import { DummyFileHandle } from './DummyFileHandle'
import { FileSystemStorageProvider } from './FileSystemStorageProvider'
import type { FileSystemFileHandle } from './types'

export class FallbackFileStorageProvider extends FileSystemStorageProvider {
  protected fileStore = new Map<string, string>()

  async requestNewFileHandle(name: string): Promise<FileSystemFileHandle> {
    this.fileStore.set(name, '{}')
    return Promise.resolve(new DummyFileHandle(name, this.fileStore))
  }

  async requestOpenFileHandle(): Promise<FileSystemFileHandle> {
    const name = 'default.json'
    return Promise.resolve(new DummyFileHandle(name, this.fileStore))
  }
}
