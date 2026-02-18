import { describe, expect, vi } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'

import { useNodeSizeObserver } from './useNodeSizeObserver'

describe('useNodeSizeObserver', () => {
  it('starts with an empty dimensions map', () => {
    const { dimensions } = useNodeSizeObserver()
    expect(dimensions.value.size).toBe(0)
  })

  it('stores dimensions of a registered element', async () => {
    const { dimensions, registerNode } = useNodeSizeObserver()

    const el = document.createElement('div')
    el.style.width = '250px'
    el.style.height = '120px'
    el.style.padding = '10px'
    el.style.boxSizing = 'border-box'

    document.body.appendChild(el)

    registerNode('node-1', el)

    await vi.waitUntil(() => {
      return dimensions.value.get('node-1')?.w === 250
    })

    expect(dimensions.value.get('node-1')).toEqual({ w: 250, h: 120 })
  })

  it('updates dimensions when the same ID is registered with a new element', async () => {
    const { dimensions, registerNode } = useNodeSizeObserver()

    const el1 = document.createElement('div')
    el1.style.width = '100px'
    document.body.appendChild(el1)
    registerNode('node-1', el1)

    const el2 = document.createElement('div')
    el2.style.width = '300px'
    document.body.appendChild(el2)
    registerNode('node-1', el2)

    await vi.waitUntil(() => {
      return dimensions.value.get('node-1')?.w === 300
    })

    expect(dimensions.value.get('node-1')?.w).toEqual(300)
  })

  it('handles null/undefined gracefully (e.g. when a component unmounts)', () => {
    const { dimensions, registerNode } = useNodeSizeObserver()

    registerNode('node-1', null)

    expect(dimensions.value.has('node-1')).toBe(false)
  })
})
