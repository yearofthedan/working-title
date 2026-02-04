import { describe, expect } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'

import { getValueAtPath } from './objects'

describe('objects', () => {
  describe('getValueAtPath', () => {
    const obj = {
      a: {
        b: 'hello',
        c: 123,
      },
      d: 'world',
    }

    it('returns the value at a nested path if it is a string', () => {
      expect(getValueAtPath(obj, 'a.b')).toBe('hello')
    })

    it('returns the value at a top-level path if it is a string', () => {
      expect(getValueAtPath(obj, 'd')).toBe('world')
    })

    it('returns the path itself if the value is not found', () => {
      expect(getValueAtPath(obj, 'a.x' as 'a')).toBe('a.x')
    })

    it('returns the path itself if the value is not a string', () => {
      expect(getValueAtPath(obj, 'a.c')).toBe('a.c')
    })

    it('returns the path itself if the value is an object', () => {
      expect(getValueAtPath(obj, 'a')).toBe('a')
    })

    it('handles null values in the object tree gracefully', () => {
      const objWithNull = { a: null }
      // @ts-expect-error - testing path through null
      expect(getValueAtPath(objWithNull, 'a.b')).toBe('a.b')
    })
  })
})
