import { describe, expect, vi } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'

import { useCanvasNavigation, type CanvasNavigationInstance } from './useCanvasNavigation'
import { type NodeChange } from '@vue-flow/core'

describe('useCanvasNavigation', () => {
  describe('navigateToNewNode', () => {
    it('navigates when node is added', () => {
      const mockFitView = vi.fn()
      let registeredHandler: (changes: NodeChange[]) => void = () => {}

      const mockInstance: CanvasNavigationInstance = {
        fitView: mockFitView,
        findNode: vi.fn(),
        onNodesChange: vi.fn((handler) => {
          registeredHandler = handler
          return { off: () => {} }
        }),
      }

      const { navigateToNewNode } = useCanvasNavigation(mockInstance)

      navigateToNewNode('new-node-id')
      registeredHandler([
        {
          type: 'dimensions',
          id: 'new-node-id',
          dimensions: { width: 100, height: 50 },
        } as unknown as NodeChange,
      ])

      expect(mockFitView).toHaveBeenCalledWith({
        nodes: ['new-node-id'],
        padding: 0.3,
        duration: 600,
      })
    })

    it('does not navigate for unrelated nodes', () => {
      const mockFitView = vi.fn()
      let registeredHandler: (changes: NodeChange[]) => void = () => {}

      const mockInstance: CanvasNavigationInstance = {
        fitView: mockFitView,
        findNode: vi.fn(),
        onNodesChange: vi.fn((handler) => {
          registeredHandler = handler
          return { off: () => {} }
        }),
      }

      const { navigateToNewNode } = useCanvasNavigation(mockInstance)

      navigateToNewNode('new-node-id')
      registeredHandler([
        {
          type: 'dimensions',
          item: { id: 'other-node-id' },
        } as unknown as NodeChange,
      ])

      expect(mockFitView).not.toHaveBeenCalled()
    })

    it('clears pending navigation after first relevant change', () => {
      const mockFitView = vi.fn()
      let registeredHandler: (changes: NodeChange[]) => void = () => {}

      const mockInstance: CanvasNavigationInstance = {
        fitView: mockFitView,
        findNode: vi.fn(),
        onNodesChange: vi.fn((handler) => {
          registeredHandler = handler
          return { off: () => {} }
        }),
      }

      const { navigateToNewNode } = useCanvasNavigation(mockInstance)

      navigateToNewNode('new-node-id')

      // First change triggers navigation
      registeredHandler([
        {
          type: 'dimensions',
          id: 'new-node-id',
          dimensions: { width: 100, height: 50 },
        } as unknown as NodeChange,
      ])
      expect(mockFitView).toHaveBeenCalledTimes(1)

      // Second change should not trigger again
      registeredHandler([
        {
          type: 'dimensions',
          id: 'new-node-id',
          dimensions: { width: 100, height: 50 },
        } as unknown as NodeChange,
      ])
      expect(mockFitView).toHaveBeenCalledTimes(1)
    })
  })
})
