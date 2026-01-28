import { FileSystemError } from './types'
import type { FileSystemFileHandle } from './types'
import type { FileSystemProvider } from './FileSystemProvider'

/**
 * Writes data to a file handle, attempting to request permission and retry if denied.
 */
export async function writeFileWithPermissionRetry<T>(
  fileSystemProvider: FileSystemProvider,
  handle: FileSystemFileHandle,
  data: T
): Promise<void> {
  try {
    await fileSystemProvider.writeFile(handle, data)
  } catch (err) {
    if (err instanceof FileSystemError && err.code === 'PERMISSION_DENIED') {
      // Attempt to request permission
      const granted = await fileSystemProvider.requestPermission(handle, 'readwrite')
      if (granted) {
        // Retry once
        await fileSystemProvider.writeFile(handle, data)
        return
      }
    }
    throw err
  }
}
