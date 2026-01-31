import { describe, it, expect, vi } from 'vitest'
import { FileSystemStorageProvider } from './FileSystemStorageProvider'
import { createFileSystemProvider } from './factory'
import { InMemoryStorageProvider } from './InMemoryStorageProvider'

describe('factory', () => {
  it('returns true when API is available', () => {
    // Default to supported
    vi.stubGlobal('showSaveFilePicker', vi.fn())
    vi.stubGlobal('showOpenFilePicker', vi.fn())
    const provider = createFileSystemProvider()

    expect(provider).not.toBeInstanceOf(InMemoryStorageProvider)
    expect(provider).toBeInstanceOf(FileSystemStorageProvider)
  })

  it('returns false when API is missing', () => {
    vi.stubGlobal('showSaveFilePicker', undefined)
    vi.stubGlobal('showOpenFilePicker', undefined)

    const provider = createFileSystemProvider()

    expect(provider).toBeInstanceOf(InMemoryStorageProvider)
  })
})
