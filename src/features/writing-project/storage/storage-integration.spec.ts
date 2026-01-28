import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref, watchEffect } from 'vue'
import { ProjectStorage, STORAGE_CONFIG } from './ProjectStorage'
import { IndexedDBProvider } from '@/utils/storage/IndexedDBProvider'
import { FileSystemProvider } from '@/utils/storage/FileSystemProvider'
import { useAutoSave } from '../domain/useAutoSave'
import { buildProjectData } from './__testHelpers__/builders'
import { FileSystemError, type FileSystemFileHandle } from '@/utils/storage/types'
describe('Storage Layer Integration', () => {
  let storage: ProjectStorage
  let provider: IndexedDBProvider
  let fsProvider: FileSystemProvider
  let dbName: string

  beforeEach(() => {
    vi.useFakeTimers()
    dbName = `test-db-${Math.random().toString(36).slice(2)}`
    provider = new IndexedDBProvider({
      ...STORAGE_CONFIG,
      dbName,
    })
    storage = new ProjectStorage(provider)
    fsProvider = new FileSystemProvider()

    // Mock FS provider methods to avoid actual browser API calls
    vi.spyOn(fsProvider, 'writeFile').mockResolvedValue(undefined)
    vi.spyOn(fsProvider, 'requestPermission').mockResolvedValue(true)
  })

  afterEach(async () => {
    vi.useRealTimers()
    vi.restoreAllMocks()

    // Clean up IndexedDB
    await provider.clear()
  })

  // Scenario 1: Complete save flow
  it('should save project to both IndexedDB and filesystem', async () => {
    const project = buildProjectData({
      projectId: 'test-1',
      meta: { name: 'Test 1', created: '2024-01-01', lastModified: '2024-01-01' },
    })
    const mockHandle = { name: 'test.json', kind: 'file' } as FileSystemFileHandle

    // 1. Save with file handle
    await storage.saveProjectWithFileHandle(project, mockHandle)

    // 2. Verify IndexedDB has project data
    const savedData = await storage.loadById('test-1')
    expect(savedData).toEqual(project)

    // 3. Verify IndexedDB has file handle metadata
    const handle = await storage.getFileHandle('test-1')
    expect(handle).toStrictEqual(mockHandle)

    // 4. Verify metadata listing
    const projects = await storage.listProjects()
    expect(projects).toHaveLength(1)
    expect(projects[0]).toMatchObject({
      id: 'test-1',
      name: 'Test 1',
      filePath: 'test.json',
    })
  })

  // Scenario 2: Auto-save flow
  it('should auto-save when project data changes', async () => {
    const projectData = ref(buildProjectData({ projectId: 'auto-save-test' }))
    const mockHandle = { name: 'auto.json', kind: 'file' } as FileSystemFileHandle

    // Associate handle
    await storage.saveProjectWithFileHandle(projectData.value, mockHandle)

    const { saveStatus } = useAutoSave({
      projectData,
      storage,
      fileSystemProvider: fsProvider,
      debounceMs: 100,
    })

    expect(saveStatus.value).toBe('saved')

    // Modify project data
    projectData.value = {
      ...projectData.value,
      meta: { ...projectData.value.meta, name: 'Updated Name' },
    }

    // Wait for debounce
    await vi.advanceTimersByTimeAsync(100)

    // Wait for save to complete
    await new Promise<void>((resolve) => {
      const stop = watchEffect(() => {
        if (saveStatus.value === 'saved') {
          stop()
          resolve()
        }
      })
      vi.runAllTimers()
    })

    expect(saveStatus.value).toBe('saved')

    // Verify save to IndexedDB
    const savedData = await storage.loadById('auto-save-test')
    expect(savedData?.meta.name).toBe('Updated Name')

    // Verify save to filesystem
    expect(fsProvider.writeFile).toHaveBeenCalledWith(
      mockHandle,
      expect.objectContaining({
        meta: expect.objectContaining({ name: 'Updated Name' }),
      })
    )
  })

  // Scenario 3: Load and resume
  it('should load project and resume file handle association', async () => {
    const project = buildProjectData({ projectId: 'resume-test' })
    const mockHandle = { name: 'resume.json', kind: 'file' } as FileSystemFileHandle

    // Save project with file handle
    await storage.saveProjectWithFileHandle(project, mockHandle)

    // Simulate "reloading" by creating a new storage instance pointing to same DB
    const newProvider = new IndexedDBProvider({
      ...STORAGE_CONFIG,
      dbName,
    })
    const newStorage = new ProjectStorage(newProvider)

    // Load project from IndexedDB
    const loadedData = await newStorage.loadById('resume-test')
    expect(loadedData).toEqual(project)

    // Verify file handle is restored
    const handle = await newStorage.getFileHandle('resume-test')
    expect(handle).toStrictEqual(mockHandle)
  })

  // Scenario 4: Permission recovery
  it('should handle permission loss gracefully', async () => {
    const projectData = ref(buildProjectData({ projectId: 'perm-test' }))
    const mockHandle = { name: 'perm.json', kind: 'file' } as FileSystemFileHandle
    await storage.saveProjectWithFileHandle(projectData.value, mockHandle)

    // Mock first write failure then success after permission request
    vi.mocked(fsProvider.writeFile)
      .mockRejectedValueOnce(new FileSystemError('Permission denied', 'PERMISSION_DENIED'))
      .mockResolvedValueOnce(undefined)

    const { saveStatus } = useAutoSave({
      projectData,
      storage,
      fileSystemProvider: fsProvider,
      debounceMs: 100,
    })

    // Trigger save
    projectData.value = { ...projectData.value, steps: [] }
    await vi.advanceTimersByTimeAsync(100)

    await new Promise<void>((resolve) => {
      const stop = watchEffect(() => {
        if (saveStatus.value === 'saved') {
          stop()
          resolve()
        }
      })
      vi.runAllTimers()
    })

    // Verify IndexedDB save still succeeded (it's called before FS)
    const savedData = await storage.loadById('perm-test')
    expect(savedData?.steps).toHaveLength(0)

    // Verify permission request was attempted
    expect(fsProvider.requestPermission).toHaveBeenCalledWith(mockHandle, 'readwrite')

    // Verify it eventually saved
    expect(saveStatus.value).toBe('saved')
    expect(fsProvider.writeFile).toHaveBeenCalledTimes(2)
  })

  // Scenario 5: Multiple projects
  it('should manage multiple projects independently', async () => {
    const projectA = buildProjectData({
      projectId: 'proj-a',
      meta: { ...buildProjectData().meta, name: 'Project A' },
    })
    const projectB = buildProjectData({
      projectId: 'proj-b',
      meta: { ...buildProjectData().meta, name: 'Project B' },
    })

    const handleA = { name: 'a.json' } as FileSystemFileHandle
    const handleB = { name: 'b.json' } as FileSystemFileHandle

    await storage.saveProjectWithFileHandle(projectA, handleA)
    await storage.saveProjectWithFileHandle(projectB, handleB)

    // List projects
    const projects = await storage.listProjects()
    expect(projects).toHaveLength(2)

    // Modify project A via auto-save
    const projectDataA = ref(projectA)
    const { saveStatus: saveStatusA } = useAutoSave({
      projectData: projectDataA,
      storage,
      fileSystemProvider: fsProvider,
      debounceMs: 100,
    })

    projectDataA.value = {
      ...projectDataA.value,
      meta: { ...projectDataA.value.meta, name: 'Updated A' },
    }
    await vi.advanceTimersByTimeAsync(100)

    await new Promise<void>((resolve) => {
      const stop = watchEffect(() => {
        if (saveStatusA.value === 'saved') {
          stop()
          resolve()
        }
      })
      vi.runAllTimers()
    })

    // Verify only A is updated
    const savedA = await storage.loadById('proj-a')
    const savedB = await storage.loadById('proj-b')
    expect(savedA?.meta.name).toBe('Updated A')
    expect(savedB?.meta.name).toBe('Project B')

    // Verify FS write only for A
    expect(fsProvider.writeFile).toHaveBeenCalledWith(handleA, expect.anything())
    expect(fsProvider.writeFile).not.toHaveBeenCalledWith(handleB, expect.anything())
  })

  // Scenario 6: No file handle
  it('should work without file handle (IndexedDB only)', async () => {
    const projectData = ref(buildProjectData({ projectId: 'no-handle' }))

    const { saveStatus } = useAutoSave({
      projectData,
      storage,
      fileSystemProvider: fsProvider,
      debounceMs: 100,
    })

    // Modify data
    projectData.value = {
      ...projectData.value,
      meta: { ...projectData.value.meta, name: 'IDB Only' },
    }
    await vi.advanceTimersByTimeAsync(100)

    await new Promise<void>((resolve) => {
      const stop = watchEffect(() => {
        if (saveStatus.value === 'saved') {
          stop()
          resolve()
        }
      })
      vi.runAllTimers()
    })

    // Verify saves to IndexedDB
    const savedData = await storage.loadById('no-handle')
    expect(savedData?.meta.name).toBe('IDB Only')

    // Verify no filesystem calls
    expect(fsProvider.writeFile).not.toHaveBeenCalled()
    expect(saveStatus.value).toBe('saved')
  })
})
