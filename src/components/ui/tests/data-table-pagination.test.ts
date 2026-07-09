import { describe, expect, it } from 'vitest'
import { getPaginationPages } from '../data-table-pagination'

describe('getPaginationPages', () => {
  it('returns an empty list for zero pages', () => {
    expect(getPaginationPages(0, 1)).toEqual([])
  })

  it('returns all pages when there are 7 or fewer', () => {
    expect(getPaginationPages(1, 1)).toEqual([1])
    expect(getPaginationPages(7, 4)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('shows the leading window with an end ellipsis near the start', () => {
    expect(getPaginationPages(12, 1)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 12])
    expect(getPaginationPages(12, 4)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 12])
  })

  it('shows the trailing window with a start ellipsis near the end', () => {
    expect(getPaginationPages(12, 9)).toEqual([
      1,
      'start-ellipsis',
      8,
      9,
      10,
      11,
      12,
    ])
    expect(getPaginationPages(12, 12)).toEqual([
      1,
      'start-ellipsis',
      8,
      9,
      10,
      11,
      12,
    ])
  })

  it('centers the current page with both ellipses in the middle', () => {
    expect(getPaginationPages(20, 10)).toEqual([
      1,
      'start-ellipsis',
      9,
      10,
      11,
      'end-ellipsis',
      20,
    ])
  })

  it('switches from leading window to centered exactly after page 4', () => {
    expect(getPaginationPages(12, 5)).toEqual([
      1,
      'start-ellipsis',
      4,
      5,
      6,
      'end-ellipsis',
      12,
    ])
  })
})
