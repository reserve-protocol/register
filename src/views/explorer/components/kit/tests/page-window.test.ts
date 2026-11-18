import { describe, expect, it } from 'vitest'
import { getPageRange, getPageWindow } from '../page-window'

describe('getPageWindow', () => {
  it('lists every page when there are five or fewer', () => {
    expect(getPageWindow(1, 1)).toEqual([1])
    expect(getPageWindow(3, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('opens with the first three pages and the last one', () => {
    expect(getPageWindow(1, 150)).toEqual([1, 2, 3, 'gap', 150])
  })

  it('keeps the current page and its neighbours between the ends', () => {
    expect(getPageWindow(75, 150)).toEqual([1, 2, 'gap', 74, 75, 76, 'gap', 150])
  })

  it('does not run past the last page', () => {
    expect(getPageWindow(150, 150)).toEqual([1, 2, 'gap', 149, 150])
  })
})

describe('getPageRange', () => {
  it('gives the 1-based rows of the page, capped at the total', () => {
    expect(getPageRange(0, 10, 1500)).toEqual({ from: 1, to: 10 })
    expect(getPageRange(3, 10, 35)).toEqual({ from: 31, to: 35 })
  })

  it('starts at zero when there is nothing to show', () => {
    expect(getPageRange(0, 10, 0)).toEqual({ from: 0, to: 0 })
  })
})
