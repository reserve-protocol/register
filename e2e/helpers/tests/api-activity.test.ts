import { describe, expect, it } from 'vitest'
import { isActivityEventRequest } from '../api'

describe('activity event API boundary', () => {
  it('matches only the production event POST', () => {
    expect(isActivityEventRequest('POST', '/v1/activity-events')).toBe(true)
    expect(isActivityEventRequest('GET', '/v1/activity-events')).toBe(false)
    expect(isActivityEventRequest('POST', '/v2/activity-events')).toBe(false)
    expect(isActivityEventRequest('POST', '/v1/activity-events/extra')).toBe(
      false
    )
  })
})
