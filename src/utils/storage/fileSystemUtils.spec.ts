import { describe, it, expect, vi, beforeEach, type MockInstance } from 'vitest'
import { writeFileWithPermissionRetry } from './fileSystemUtils'
import { FileSystemError } from './types'
import type { FileSystemFileHandle } from './types'
import type { FileSystemProvider } from './FileSystemProvider'

describe('fileSystemUtils', () => {
  describe('writeFileWithPermissionRetry', () => {
    let mockFSProvider: {
      writeFile: MockInstance
      requestPermission: MockInstance
    }
    let mockHandle: FileSystemFileHandle

    beforeEach(() => {
      mockHandle = { name: 'test.json' } as FileSystemFileHandle
      mockFSProvider = {
        writeFile: vi.fn(),
        requestPermission: vi.fn(),
      }
    })

    it('writes successfully on first attempt', async () => {
      mockFSProvider.writeFile.mockResolvedValue(undefined)

      await writeFileWithPermissionRetry(
        mockFSProvider as unknown as FileSystemProvider,
        mockHandle,
        {
          foo: 'bar',
        }
      )

      expect(mockFSProvider.writeFile).toHaveBeenCalledTimes(1)
      expect(mockFSProvider.requestPermission).not.toHaveBeenCalled()
    })

    it('retries once if permission is denied but then granted', async () => {
      mockFSProvider.writeFile
        .mockRejectedValueOnce(new FileSystemError('Denied', 'PERMISSION_DENIED'))
        .mockResolvedValueOnce(undefined)
      mockFSProvider.requestPermission.mockResolvedValue(true)

      await writeFileWithPermissionRetry(
        mockFSProvider as unknown as FileSystemProvider,
        mockHandle,
        {
          foo: 'bar',
        }
      )

      expect(mockFSProvider.requestPermission).toHaveBeenCalledWith(mockHandle, 'readwrite')
      expect(mockFSProvider.writeFile).toHaveBeenCalledTimes(2)
    })

    it('throws original error if permission is denied and then refused by user', async () => {
      const originalError = new FileSystemError('Denied', 'PERMISSION_DENIED')
      mockFSProvider.writeFile.mockRejectedValue(originalError)
      mockFSProvider.requestPermission.mockResolvedValue(false)

      await expect(
        writeFileWithPermissionRetry(mockFSProvider as unknown as FileSystemProvider, mockHandle, {
          foo: 'bar',
        })
      ).rejects.toThrow(originalError)

      expect(mockFSProvider.requestPermission).toHaveBeenCalled()
      expect(mockFSProvider.writeFile).toHaveBeenCalledTimes(1)
    })

    it('throws original error if it is not a permission error', async () => {
      const otherError = new FileSystemError('Failed', 'WRITE_FAILED')
      mockFSProvider.writeFile.mockRejectedValue(otherError)

      await expect(
        writeFileWithPermissionRetry(mockFSProvider as unknown as FileSystemProvider, mockHandle, {
          foo: 'bar',
        })
      ).rejects.toThrow(otherError)

      expect(mockFSProvider.requestPermission).not.toHaveBeenCalled()
    })
  })
})
