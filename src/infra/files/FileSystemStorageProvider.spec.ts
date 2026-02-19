import { describe, expect, beforeEach, vi } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'

import { FileSystemStorageProvider } from './FileSystemStorageProvider'

describe('FileSystemStorageProvider', () => {
  it.scoped({ globalMocks: ['logging'] })

  let provider: FileSystemStorageProvider

  beforeEach(() => {
    provider = new FileSystemStorageProvider()
    vi.stubGlobal('showSaveFilePicker', vi.fn())
    vi.stubGlobal('showOpenFilePicker', vi.fn())
  })

  describe('requestNewFileHandle', () => {
    it('calls showSaveFilePicker with correct options', async () => {
      const mockHandle = { kind: 'file', name: 'test.json' } as FileSystemFileHandle
      const showSaveFilePicker = vi.fn().mockResolvedValue(mockHandle)
      vi.stubGlobal('showSaveFilePicker', showSaveFilePicker)

      const result = await provider.requestNewFileHandle('Untitled.json')

      expect(showSaveFilePicker).toHaveBeenCalledWith({
        suggestedName: 'Untitled.json',
        types: [
          {
            description: 'Project Files',
            accept: { 'application/json': ['.json'] },
          },
        ],
      })
      expect(result).toBe(mockHandle)
    })

    it('throws ABORTED error when user cancels', async () => {
      const abortError = new Error('The user aborted a request.')
      abortError.name = 'AbortError'
      vi.stubGlobal('showSaveFilePicker', vi.fn().mockRejectedValue(abortError))

      await expect(provider.requestNewFileHandle('test.json')).rejects.toThrow(
        expect.objectContaining({ code: 'ABORTED' })
      )
    })

    it('throws WRITE_FAILED error on other errors', async () => {
      vi.stubGlobal('showSaveFilePicker', vi.fn().mockRejectedValue(new Error('Disk full')))

      await expect(provider.requestNewFileHandle('test.json')).rejects.toThrow(
        expect.objectContaining({ code: 'WRITE_FAILED' })
      )
    })
  })

  describe('requestOpenFileHandle', () => {
    it('calls showOpenFilePicker and returns the first handle', async () => {
      const mockHandle = { kind: 'file', name: 'test.json' } as FileSystemFileHandle
      const showOpenFilePicker = vi.fn().mockResolvedValue([mockHandle])
      vi.stubGlobal('showOpenFilePicker', showOpenFilePicker)

      const result = await provider.requestOpenFileHandle()

      expect(showOpenFilePicker).toHaveBeenCalledWith({
        multiple: false,
        types: [
          {
            description: 'Project Files',
            accept: { 'application/json': ['.json'] },
          },
        ],
      })
      expect(result).toBe(mockHandle)
    })

    it('throws ABORTED error when user cancels', async () => {
      const abortError = new Error('The user aborted a request.')
      abortError.name = 'AbortError'
      vi.stubGlobal('showOpenFilePicker', vi.fn().mockRejectedValue(abortError))

      await expect(provider.requestOpenFileHandle()).rejects.toThrow(
        expect.objectContaining({ code: 'ABORTED' })
      )
    })
  })

  describe('readFile', () => {
    it('reads and parses JSON content', async () => {
      const mockData = { title: 'Test' }
      const mockFile = {
        text: vi.fn().mockResolvedValue(JSON.stringify(mockData)),
      }
      const mockHandle = {
        getFile: vi.fn().mockResolvedValue(mockFile),
      } as unknown as FileSystemFileHandle

      const result = await provider.readAsJson(mockHandle)

      expect(result).toEqual(mockData)
      expect(mockHandle.getFile).toHaveBeenCalled()
      expect(mockFile.text).toHaveBeenCalled()
    })

    it('throws READ_FAILED on error', async () => {
      const mockHandle = {
        getFile: vi.fn().mockRejectedValue(new Error('Read error')),
      } as unknown as FileSystemFileHandle

      await expect(provider.readAsJson(mockHandle)).rejects.toThrow(
        expect.objectContaining({ code: 'READ_FAILED' })
      )
    })
  })

  describe('writeFile', () => {
    it('writes JSON string to the file', async () => {
      const mockData = { title: 'Test' }
      const mockWritable = {
        write: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      }
      const mockHandle = {
        createWritable: vi.fn().mockResolvedValue(mockWritable),
      } as unknown as FileSystemFileHandle

      await provider.writeAsJson(mockHandle, mockData)

      expect(mockHandle.createWritable).toHaveBeenCalled()
      expect(mockWritable.write).toHaveBeenCalledWith(JSON.stringify(mockData, null, 2))
      expect(mockWritable.close).toHaveBeenCalled()
    })

    it('throws PERMISSION_DENIED on NotAllowedError', async () => {
      const notAllowedError = new Error('Write permission denied')
      notAllowedError.name = 'NotAllowedError'
      const mockHandle = {
        createWritable: vi.fn().mockRejectedValue(notAllowedError),
      } as unknown as FileSystemFileHandle

      await expect(provider.writeAsJson(mockHandle, {})).rejects.toThrow(
        expect.objectContaining({ code: 'PERMISSION_DENIED' })
      )
    })

    it('throws WRITE_FAILED on other errors', async () => {
      const mockHandle = {
        createWritable: vi.fn().mockRejectedValue(new Error('Unknown error')),
      } as unknown as FileSystemFileHandle

      await expect(provider.writeAsJson(mockHandle, {})).rejects.toThrow(
        expect.objectContaining({ code: 'WRITE_FAILED' })
      )
    })
  })

  describe('permission methods', () => {
    it('verifyPermission returns true if granted', async () => {
      const mockHandle = {
        queryPermission: vi.fn().mockResolvedValue('granted'),
      } as unknown as FileSystemFileHandle

      const result = await provider.verifyPermission(mockHandle, 'readwrite')
      expect(result).toBe(true)
      expect(mockHandle.queryPermission).toHaveBeenCalledWith({ mode: 'readwrite' })
    })

    it('verifyPermission returns false if not granted', async () => {
      const mockHandle = {
        queryPermission: vi.fn().mockResolvedValue('prompt'),
      } as unknown as FileSystemFileHandle

      const result = await provider.verifyPermission(mockHandle, 'readwrite')
      expect(result).toBe(false)
    })

    it('requestPermission returns true if granted', async () => {
      const mockHandle = {
        requestPermission: vi.fn().mockResolvedValue('granted'),
      } as unknown as FileSystemFileHandle

      const result = await provider.requestPermission(mockHandle, 'readwrite')
      expect(result).toBe(true)
      expect(mockHandle.requestPermission).toHaveBeenCalledWith({ mode: 'readwrite' })
    })
  })
})
