import { FallbackFileStorageProvider } from '../FallbackFileStorageProvider'
import { DummyFileHandle } from '../DummyFileHandle'
import type { FileSystemFileHandle } from '../types'

import { buildProjectData } from '@/features/project-storage/__testHelpers__/builders'
import { generateId } from '@/utils/ids'

class TestFileHandle extends DummyFileHandle {
  // In test env we care that the handle is saved to indexdb.
  get isDummy() {
    return false
  }
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
}
