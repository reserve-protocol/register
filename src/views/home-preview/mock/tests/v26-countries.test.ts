import { describe, expect, it } from 'vitest'
import { V26_COUNTRY_COUNT, V26_COUNTRY_GROUPS } from '../v26-countries'
import geography from '../v26-geography.json'

describe('v26 confirmed service coverage', () => {
  it('uses the supplied BFF United, BFF Classic and confirmed PORTFOLIO lists', () => {
    const fullService = V26_COUNTRY_GROUPS.custodial
    expect(fullService).toHaveLength(58)
    expect(new Set(fullService).size).toBe(58)
    expect(V26_COUNTRY_GROUPS.selfCustody).toEqual(['United States'])
    expect(V26_COUNTRY_COUNT).toBe(59)
    expect(fullService).not.toContain('United States')
    expect(fullService).toEqual(expect.arrayContaining([
      'Venezuela', 'Guatemala', 'India', 'Brunei', 'Maldives',
      'Central African Republic', 'Lesotho', 'Togo', 'Ivory Coast', 'Eswatini',
    ]))
  })

  it('represents every listed country in both graphics, including tiny countries', () => {
    for (const dots of [geography.mapDots, geography.globeDots]) {
      const names = new Set(dots.map((dot) => dot[2]))
      for (const country of [...V26_COUNTRY_GROUPS.custodial, ...V26_COUNTRY_GROUPS.selfCustody]) {
        expect(names.has(country), country).toBe(true)
      }
      expect(dots.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y))).toBe(true)
    }
    // US mainland: tagged by country boundaries, not a nearby country's centroid.
    expect(geography.globeDots.some(([lon, lat, name]) =>
      Number(lon) > -110 && Number(lon) < -90 && Number(lat) > 30 && Number(lat) < 45 && name === 'United States'
    )).toBe(true)
  })
})
