import { supportsFilePicker } from '@/utils/browsers'
import { FileSystemStorageProvider } from './FileSystemStorageProvider'
import { FallbackFileStorageProvider } from './FallbackFileStorageProvider'

export function createFileSystemProvider(): FileSystemStorageProvider {
  if (supportsFilePicker()) {
    return new FileSystemStorageProvider()
  }

  console.warn('FileSystem API not supported. Using in memory provider for file storage.')
  return new FallbackFileStorageProvider()
}
