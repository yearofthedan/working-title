import { describe, expect, vi } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'

import { FileSystemStorageProvider } from './FileSystemStorageProvider'
import { createFileSystemProvider } from './factory'
import { FallbackFileStorageProvider } from './FallbackFileStorageProvider'

describe('factory', () => {
  it('returns true when API is available', () => {
    // Default to supported
    vi.stubGlobal('showSaveFilePicker', vi.fn())
    vi.stubGlobal('showOpenFilePicker', vi.fn())
    const provider = createFileSystemProvider()

    expect(provider).not.toBeInstanceOf(FallbackFileStorageProvider)
    expect(provider).toBeInstanceOf(FileSystemStorageProvider)
  })

  it('returns false when API is missing', () => {
    vi.stubGlobal('showSaveFilePicker', undefined)
    vi.stubGlobal('showOpenFilePicker', undefined)

    const provider = createFileSystemProvider()

    expect(provider).toBeInstanceOf(FallbackFileStorageProvider)
  })
})
