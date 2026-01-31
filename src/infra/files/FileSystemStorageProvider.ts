import type { FileSystemFileHandle, SaveFilePickerOptions, OpenFilePickerOptions } from './types'
import { FileSystemError } from './errors'

export class FileSystemStorageProvider {
  defaultTypes: {
    description: string
    accept: { [key: string]: string[] }
  }
  constructor(
    defaultTypes = {
      description: 'Project Files',
      accept: { 'application/json': ['.json'] },
    }
  ) {
    this.defaultTypes = defaultTypes
  }
  async requestNewFileHandle(suggestedName: string): Promise<FileSystemFileHandle> {
    const options: SaveFilePickerOptions = {
      suggestedName,
      types: [this.defaultTypes],
    }
    try {
      return await window.showSaveFilePicker(options)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new FileSystemError('File picker was cancelled', 'ABORTED')
      }
      throw new FileSystemError(
        `Failed to create new file: ${err instanceof Error ? err.message : 'Unknown error'}`,
        'WRITE_FAILED'
      )
    }
  }

  async requestOpenFileHandle(): Promise<FileSystemFileHandle> {
    const options: OpenFilePickerOptions = {
      multiple: false,
      types: [this.defaultTypes],
    }

    try {
      const [handle] = await window.showOpenFilePicker(options)
      if (!handle) {
        throw new FileSystemError('No file selected', 'ABORTED')
      }
      return handle
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new FileSystemError('File picker was cancelled', 'ABORTED')
      }
      throw new FileSystemError(
        `Failed to open file: ${err instanceof Error ? err.message : 'Unknown error'}`,
        'READ_FAILED'
      )
    }
  }

  async readAsJson<T>(handle: FileSystemFileHandle): Promise<T> {
    try {
      const file = await handle.getFile()
      const content = await file.text()
      return JSON.parse(content) as T
    } catch (err) {
      throw new FileSystemError(
        `Failed to read file: ${err instanceof Error ? err.message : 'Unknown error'}`,
        'READ_FAILED'
      )
    }
  }

  async writeAsJson<T>(handle: FileSystemFileHandle, data: T): Promise<void> {
    try {
      const writable = await handle.createWritable()
      await writable.write(JSON.stringify(data, null, 2))
      await writable.close()
    } catch (err) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        throw new FileSystemError('Write permission denied', 'PERMISSION_DENIED')
      }
      throw new FileSystemError(
        `Failed to write file: ${err instanceof Error ? err.message : 'Unknown error'}`,
        'WRITE_FAILED'
      )
    }
  }

  async verifyPermission(
    handle: FileSystemFileHandle,
    mode: 'read' | 'readwrite'
  ): Promise<boolean> {
    const state = await handle.queryPermission({ mode })
    return state === 'granted'
  }

  async requestPermission(
    handle: FileSystemFileHandle,
    mode: 'read' | 'readwrite'
  ): Promise<boolean> {
    const state = await handle.requestPermission({ mode })
    return state === 'granted'
  }

  async writePermittedAsJson<T>(handle: FileSystemFileHandle, data: T): Promise<void> {
    try {
      await this.writeAsJson(handle, data)
    } catch (err) {
      if (err instanceof FileSystemError && err.code === 'PERMISSION_DENIED') {
        const granted = await this.requestPermission(handle, 'readwrite')
        if (granted) {
          await this.writeAsJson(handle, data)
          return
        }
      }
      throw err
    }
  }
}
