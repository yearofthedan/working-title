import type {
  FileSystemFileHandle,
  FileSystemDirectoryHandle,
  SaveFilePickerOptions,
  OpenFilePickerOptions,
  DirectoryPickerOptions,
} from './types'
import { FileSystemError } from './errors'
import { logError } from '@/infra/logging/globals'

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
      const error = new FileSystemError(
        `Failed to create new file: ${err instanceof Error ? err.message : 'Unknown error'}`,
        'WRITE_FAILED'
      )
      logError(error, { suggestedName, originalError: err })
      throw error
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
      const error = new FileSystemError(
        `Failed to open file: ${err instanceof Error ? err.message : 'Unknown error'}`,
        'READ_FAILED'
      )
      logError(error, { originalError: err })
      throw error
    }
  }

  async requestDirectoryHandle(
    options: DirectoryPickerOptions = {}
  ): Promise<FileSystemDirectoryHandle> {
    try {
      return await window.showDirectoryPicker(options)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new FileSystemError('Directory picker was cancelled', 'ABORTED')
      }
      const error = new FileSystemError(
        `Failed to select directory: ${err instanceof Error ? err.message : 'Unknown error'}`,
        'READ_FAILED'
      )
      logError(error, { originalError: err })
      throw error
    }
  }

  async readAsJson<T>(handle: FileSystemFileHandle): Promise<T> {
    try {
      const file = await handle.getFile()
      const content = await file.text()
      return JSON.parse(content) as T
    } catch (err) {
      const error = new FileSystemError(
        `Failed to read file: ${err instanceof Error ? err.message : 'Unknown error'}`,
        'READ_FAILED'
      )
      logError(error, { fileName: handle.name, originalError: err })
      throw error
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
      const error = new FileSystemError(
        `Failed to write file: ${err instanceof Error ? err.message : 'Unknown error'}`,
        'WRITE_FAILED'
      )
      logError(error, { fileName: handle.name, originalError: err })
      throw error
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

  async readJsonFromDirectory<T>(
    dirHandle: FileSystemDirectoryHandle,
    fileName: string
  ): Promise<T> {
    try {
      const fileHandle = await dirHandle.getFileHandle(fileName)
      return await this.readAsJson<T>(fileHandle)
    } catch (err) {
      if (err instanceof FileSystemError) throw err
      const error = new FileSystemError(
        `Failed to read ${fileName} from directory: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`,
        'READ_FAILED'
      )
      logError(error, { fileName, directory: dirHandle.name, originalError: err })
      throw error
    }
  }

  async writeJsonToDirectory<T>(
    dirHandle: FileSystemDirectoryHandle,
    fileName: string,
    data: T
  ): Promise<void> {
    try {
      const fileHandle = await dirHandle.getFileHandle(fileName, { create: true })
      await this.writePermittedAsJson(fileHandle, data)
    } catch (err) {
      if (err instanceof FileSystemError) throw err
      const error = new FileSystemError(
        `Failed to write ${fileName} to directory: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`,
        'WRITE_FAILED'
      )
      logError(error, { fileName, directory: dirHandle.name, originalError: err })
      throw error
    }
  }
}
