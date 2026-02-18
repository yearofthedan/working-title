import { describe, expect } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'

import en from './en.json'

describe('en.json locale structure', () => {
  it('has required top-level sections', () => {
    expect(en).toHaveProperty('app')
    expect(en).toHaveProperty('common')
    expect(en).toHaveProperty('errors')
  })

  it('has critical app strings', () => {
    expect(en.app.name).toBeTruthy()
    expect(en.app.home).toBeDefined()
    expect(en.app.canvas.emptyState).toBeDefined()
  })

  it('has critical common strings', () => {
    expect(en.common.actions.save).toBeTruthy()
    expect(en.common.actions.cancel).toBeTruthy()
  })

  it('has critical error strings', () => {
    expect(en.errors.generic).toBeTruthy()
  })
})