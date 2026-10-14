import { afterEach, describe, expect, it } from 'vitest'
import { claimAutoReload, isChunkLoadError } from '../chunk-reload'

describe('isChunkLoadError', () => {
  it('matches failed chunk and CSS loads', () => {
    expect(
      isChunkLoadError(
        new Error('Failed to fetch dynamically imported module: /a.js')
      )
    ).toBe(true)
    expect(
      isChunkLoadError(new Error('Unable to preload CSS for /assets/a.css'))
    ).toBe(true)
  })

  it('ignores other errors', () => {
    expect(isChunkLoadError(new Error('boom'))).toBe(false)
  })
})

describe('claimAutoReload', () => {
  afterEach(() => sessionStorage.clear())

  it('allows one reload per minute', () => {
    expect(claimAutoReload(1_000)).toBe(true)
    expect(claimAutoReload(30_000)).toBe(false)
    expect(claimAutoReload(61_001)).toBe(true)
  })
})
