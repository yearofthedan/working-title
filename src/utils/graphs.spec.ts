import { describe, expect } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'

import { partitionNodesByRoot } from './graphs'

describe('graphs', () => {
  describe('partitionNodesByRoot', () => {
    it('separates two independent tracks with their own roots', () => {
      const nodes = [{ id: 'root-1' }, { id: 'child-1' }, { id: 'root-2' }, { id: 'child-2' }]
      const connections = [
        { source: 'root-1', target: 'child-1' },
        { source: 'root-2', target: 'child-2' },
      ]
      const roots = [
        { id: 'track-A', root: nodes[0]! },
        { id: 'track-B', root: nodes[2]! },
      ]

      const result = partitionNodesByRoot(nodes, connections, roots)

      expect(result.groups[0]![1].map((n) => n.id)).toEqual(['root-1', 'child-1'])
      expect(result.groups[1]![1].map((n) => n.id)).toEqual(['root-2', 'child-2'])
      expect(result.orphans).toHaveLength(0)
    })

    it('stops traversal when hitting another root (boundary check)', () => {
      const nodes = [{ id: 'main-root' }, { id: 'char-root' }, { id: 'char-detail' }]
      const connections = [
        { source: 'main-root', target: 'char-root' },
        { source: 'char-root', target: 'char-detail' },
      ]
      const roots = [
        { id: 'main', root: nodes[0]! },
        { id: 'char', root: nodes[1]! },
      ]

      const result = partitionNodesByRoot(nodes, connections, roots)

      expect(result.groups[0]![1].map((n) => n.id)).toEqual(['main-root'])
      expect(result.groups[1]![1].map((n) => n.id)).toEqual(['char-root', 'char-detail'])
    })

    it('collects unconnected nodes as orphans', () => {
      const nodes = [{ id: 'root' }, { id: 'orphan' }]
      const roots = [{ id: 'main', root: nodes[0]! }]

      const result = partitionNodesByRoot(nodes, [], roots)

      expect(result.groups[0]![1].map((n) => n.id)).toEqual(['root'])
      expect(result.orphans.map((n) => n.id)).toEqual(['orphan'])
    })
  })
})
