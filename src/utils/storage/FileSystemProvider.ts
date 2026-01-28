import { FileSystemError } from './types'
import type { FileSystemFileHandle, SaveFilePickerOptions, OpenFilePickerOptions } from './types'

/**
 * FileSystemProvider provides a thin wrapper around the native File System Access API.
 * This allows for persistent file storage with automatic syncing.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
 */
export class FileSystemProvider {
  /**
   * Check if the File System Access API is supported in the current environment.
   */
  isSupported(): boolean {
    return (
      typeof window.showSaveFilePicker === 'function' &&
      typeof window.showOpenFilePicker === 'function'
    )
  }

  /**
   * Request permission to create a new file (shows file picker).
   * @param suggestedName The default filename to suggest to the user.
   */
  async requestNewFileHandle(suggestedName: string): Promise<FileSystemFileHandle> {
    this.ensureSupport()

    const options: SaveFilePickerOptions = {
      suggestedName,
      types: [
        {
          description: 'Project Files',
          accept: { 'application/json': ['.json'] },
        },
      ],
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

  /**
   * Request permission to open an existing file (shows file picker).
   */
  async requestOpenFileHandle(): Promise<FileSystemFileHandle> {
    this.ensureSupport()

    const options: OpenFilePickerOptions = {
      multiple: false,
      types: [
        {
          description: 'Project Files',
          accept: { 'application/json': ['.json'] },
        },
      ],
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

  /**
   * Read JSON content from a file handle.
   */
  async readFile<T>(handle: FileSystemFileHandle): Promise<T> {
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

  /**
   * Write JSON content to a file handle.
   */
  async writeFile<T>(handle: FileSystemFileHandle, data: T): Promise<void> {
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

  /**
   * Verify we still have permission to access a handle.
   */
  async verifyPermission(
    handle: FileSystemFileHandle,
    mode: 'read' | 'readwrite'
  ): Promise<boolean> {
    const state = await handle.queryPermission({ mode })
    return state === 'granted'
  }

  /**
   * Request permission if we don't have it.
   */
  async requestPermission(
    handle: FileSystemFileHandle,
    mode: 'read' | 'readwrite'
  ): Promise<boolean> {
    const state = await handle.requestPermission({ mode })
    return state === 'granted'
  }

  /**
   * Get file name from handle.
   */
  getFileName(handle: FileSystemFileHandle): string {
    return handle.name
  }

  /**
   * Helper to ensure API support before proceeding.
   */
  private ensureSupport(): void {
    if (!this.isSupported()) {
      throw new FileSystemError(
        'File System Access API is not supported in this browser',
        'NOT_SUPPORTED'
      )
    }
  }
}
