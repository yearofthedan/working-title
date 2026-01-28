import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ProjectStorage } from './ProjectStorage'
import { buildProjectData } from './__testHelpers__/builders'
import type { StorageProvider } from '@/utils/storage/StorageProvider'
import type { FileSystemFileHandle } from '@/utils/storage/types'

describe('ProjectStorage', () => {
  let storage: ProjectStorage
  let mockProvider: StorageProvider

  beforeEach(() => {
    mockProvider = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      getAllKeys: vi.fn(),
    } as unknown as StorageProvider
    storage = new ProjectStorage(mockProvider)
  })

  describe('save', () => {
    it('saves project data and updates metadata', async () => {
      const project = buildProjectData({
        projectId: 'test-1',
        meta: { name: 'Test', created: '2024', lastModified: '2024' },
      })

      await storage.save(project)

      expect(mockProvider.setItem).toHaveBeenCalledWith(
        'working-title:projects:test-1',
        JSON.stringify(project)
      )
      expect(mockProvider.setItem).toHaveBeenCalledWith(
        'working-title:current-project-id',
        'test-1'
      )
      // Metadata update
      expect(mockProvider.setItem).toHaveBeenCalledWith(
        'test-1',
        expect.objectContaining({
          id: 'test-1',
          name: 'Test',
        }),
        'projectMetadata'
      )
    })
  })

  describe('loadById', () => {
    it('loads project data and migrates it', async () => {
      const project = buildProjectData({ projectId: 'test-1', schemaVersion: '1.0.0' })
      vi.mocked(mockProvider.getItem).mockResolvedValue(JSON.stringify(project))

      const loaded = await storage.loadById('test-1')

      expect(loaded).toEqual(project)
      expect(mockProvider.getItem).toHaveBeenCalledWith('working-title:projects:test-1')
    })

    it('returns null if project not found', async () => {
      vi.mocked(mockProvider.getItem).mockResolvedValue(null)

      const loaded = await storage.loadById('non-existent')

      expect(loaded).toBeNull()
    })
  })

  describe('file handle persistence', () => {
    const mockFileHandle = {
      name: 'story.json',
      kind: 'file',
    } as unknown as FileSystemFileHandle

    it('saves project with file handle', async () => {
      const project = buildProjectData({ projectId: 'test-1' })
      vi.mocked(mockProvider.getItem).mockResolvedValue({ id: 'test-1' }) // Mock existing metadata

      await storage.saveProjectWithFileHandle(project, mockFileHandle)

      expect(mockProvider.setItem).toHaveBeenCalledWith(
        'test-1',
        expect.objectContaining({
          fileHandle: mockFileHandle,
          filePath: 'story.json',
        }),
        'projectMetadata'
      )
    })

    it('retrieves file handle for project', async () => {
      vi.mocked(mockProvider.getItem).mockResolvedValue({
        id: 'test-1',
        fileHandle: mockFileHandle,
      })

      const handle = await storage.getFileHandle('test-1')

      expect(handle).toBe(mockFileHandle)
      expect(mockProvider.getItem).toHaveBeenCalledWith('test-1', 'projectMetadata')
    })

    it('returns null if no file handle exists', async () => {
      vi.mocked(mockProvider.getItem).mockResolvedValue({ id: 'test-1' })

      const handle = await storage.getFileHandle('test-1')

      expect(handle).toBeNull()
    })

    it('clears file handle', async () => {
      vi.mocked(mockProvider.getItem).mockResolvedValue({
        id: 'test-1',
        fileHandle: mockFileHandle,
      })

      await storage.clearFileHandle('test-1')

      expect(mockProvider.setItem).toHaveBeenCalledWith(
        'test-1',
        expect.objectContaining({
          fileHandle: undefined,
          filePath: undefined,
        }),
        'projectMetadata'
      )
    })
  })

  describe('listProjects', () => {
    it('returns all project metadata', async () => {
      vi.mocked(mockProvider.getAllKeys).mockResolvedValue(['p1', 'p2'])
      vi.mocked(mockProvider.getItem)
        .mockResolvedValueOnce({ id: 'p1', name: 'Project 1' })
        .mockResolvedValueOnce({ id: 'p2', name: 'Project 2' })

      const projects = await storage.listProjects()

      expect(projects).toHaveLength(2)
      expect(projects[0]?.name).toBe('Project 1')
      expect(projects[1]?.name).toBe('Project 2')
    })
  })
})
