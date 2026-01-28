import { describe, it, expect, vi, beforeEach, type MockInstance } from 'vitest'
import { ref, type Ref } from 'vue'
import { useAutoSave } from './useAutoSave'
import { buildProjectData } from '../storage/__testHelpers__/builders'
import type { ProjectStorage } from '../storage/ProjectStorage'
import type { FileSystemProvider } from '@/utils/storage/FileSystemProvider'
import { FileSystemError, type FileSystemFileHandle } from '@/utils/storage/types'
import type { ProjectData } from '../storage/types'

describe('useAutoSave', () => {
  let mockStorage: {
    save: MockInstance
    getFileHandle: MockInstance
  }
  let mockFileSystemProvider: {
    writeFile: MockInstance
    requestPermission: MockInstance
  }
  let projectData: Ref<ProjectData>

  beforeEach(() => {
    vi.useFakeTimers()
    projectData = ref(buildProjectData())
    mockStorage = {
      save: vi.fn().mockResolvedValue(undefined),
      getFileHandle: vi.fn().mockResolvedValue(null),
    }
    mockFileSystemProvider = {
      writeFile: vi.fn().mockResolvedValue(undefined),
      requestPermission: vi.fn().mockResolvedValue(true),
    }
  })

  it('updates saveStatus correctly during a save cycle', async () => {
    const { saveStatus } = useAutoSave({
      projectData,
      storage: mockStorage as unknown as ProjectStorage,
      fileSystemProvider: mockFileSystemProvider as unknown as FileSystemProvider,
    })

    expect(saveStatus.value).toBe('saved')

    // Trigger change
    projectData.value.meta.name = 'Updated'
    vi.advanceTimersByTime(2000)

    await vi.runAllTimersAsync()

    expect(saveStatus.value).toBe('saved')
    expect(mockStorage.save).toHaveBeenCalled()
  })

  it('debounces multiple rapid changes', async () => {
    useAutoSave({
      projectData,
      storage: mockStorage as unknown as ProjectStorage,
      fileSystemProvider: mockFileSystemProvider as unknown as FileSystemProvider,
      debounceMs: 2000,
    })

    projectData.value.meta.name = 'Update 1'
    vi.advanceTimersByTime(1000)
    projectData.value.meta.name = 'Update 2'
    vi.advanceTimersByTime(1000)
    projectData.value.meta.name = 'Update 3'

    expect(mockStorage.save).not.toHaveBeenCalled()

    vi.advanceTimersByTime(2000)
    await vi.runAllTimersAsync()

    expect(mockStorage.save).toHaveBeenCalledTimes(1)
  })

  it('saves to filesystem if file handle exists', async () => {
    const mockHandle = { name: 'test.json' } as unknown as FileSystemFileHandle
    mockStorage.getFileHandle.mockResolvedValue(mockHandle)

    useAutoSave({
      projectData,
      storage: mockStorage as unknown as ProjectStorage,
      fileSystemProvider: mockFileSystemProvider as unknown as FileSystemProvider,
    })

    projectData.value.meta.name = 'Updated'
    vi.advanceTimersByTime(2000)
    await vi.runAllTimersAsync()

    expect(mockStorage.save).toHaveBeenCalled()
    expect(mockFileSystemProvider.writeFile).toHaveBeenCalledWith(mockHandle, projectData.value)
  })

  it('handles permission errors and retries once if granted', async () => {
    const mockHandle = { name: 'test.json' } as unknown as FileSystemFileHandle
    mockStorage.getFileHandle.mockResolvedValue(mockHandle)

    // First call fails with permission denied
    mockFileSystemProvider.writeFile
      .mockRejectedValueOnce(new FileSystemError('Denied', 'PERMISSION_DENIED'))
      .mockResolvedValueOnce(undefined)

    useAutoSave({
      projectData,
      storage: mockStorage as unknown as ProjectStorage,
      fileSystemProvider: mockFileSystemProvider as unknown as FileSystemProvider,
    })

    projectData.value.meta.name = 'Updated'
    vi.advanceTimersByTime(2000)
    await vi.runAllTimersAsync()

    expect(mockFileSystemProvider.requestPermission).toHaveBeenCalledWith(mockHandle, 'readwrite')
    expect(mockFileSystemProvider.writeFile).toHaveBeenCalledTimes(2)
  })

  it('sets error state if permission is denied after request', async () => {
    const mockHandle = { name: 'test.json' } as unknown as FileSystemFileHandle
    mockStorage.getFileHandle.mockResolvedValue(mockHandle)

    mockFileSystemProvider.writeFile.mockRejectedValue(
      new FileSystemError('Denied', 'PERMISSION_DENIED')
    )
    mockFileSystemProvider.requestPermission.mockResolvedValue(false)

    const { saveStatus, errorMessage } = useAutoSave({
      projectData,
      storage: mockStorage as unknown as ProjectStorage,
      fileSystemProvider: mockFileSystemProvider as unknown as FileSystemProvider,
    })

    projectData.value.meta.name = 'Updated'
    vi.advanceTimersByTime(2000)
    await vi.runAllTimersAsync()

    expect(saveStatus.value).toBe('error')
    expect(errorMessage.value).toBe('Denied')
  })

  it('tracks lastSaved timestamp', async () => {
    const { lastSaved } = useAutoSave({
      projectData,
      storage: mockStorage as unknown as ProjectStorage,
      fileSystemProvider: mockFileSystemProvider as unknown as FileSystemProvider,
    })

    expect(lastSaved.value).toBeNull()

    projectData.value.meta.name = 'Change'
    vi.advanceTimersByTime(2000)
    await vi.runAllTimersAsync()

    expect(lastSaved.value).toBeInstanceOf(Date)
  })
})
