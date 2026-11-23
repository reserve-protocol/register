import { describe, expect, it } from 'vitest'
import { COUNTRIES, COUNTRY_COUNT, COUNTRY_SERVICE } from '../countries'
import geography from '../geography.json'

const names = (service: keyof typeof COUNTRIES) =>
  COUNTRIES[service].map((country) => country.name)

describe('UGLYCASH service coverage', () => {
  it('uses the supplied BFF United, BFF Classic and confirmed self-custody lists', () => {
    const fullService = names('custodial')
    expect(fullService).toHaveLength(58)
    expect(new Set(fullService).size).toBe(58)
    expect(names('selfCustody')).toEqual(['United States'])
    expect(COUNTRY_COUNT).toBe(59)
    expect(COUNTRY_SERVICE['United States']).toBe('selfCustody')
    expect(fullService).toEqual(
      expect.arrayContaining([
        'Venezuela', 'Guatemala', 'India', 'Brunei', 'Maldives',
        'Central African Republic', 'Lesotho', 'Togo', 'Ivory Coast', 'Eswatini',
      ])
    )
  })

  it('gives every country a unique region code with a display name', () => {
    const codes = [...COUNTRIES.custodial, ...COUNTRIES.selfCustody].map(
      (country) => country.code
    )
    expect(new Set(codes).size).toBe(COUNTRY_COUNT)
    const display = new Intl.DisplayNames('en', { type: 'region' })
    for (const code of codes) expect(display.of(code), code).not.toBe(code)
  })

  it('represents every listed country in both graphics, including tiny countries', () => {
    for (const dots of [geography.mapDots, geography.globeDots]) {
      const tagged = new Set(dots.map((dot) => dot[2]))
      for (const country of Object.keys(COUNTRY_SERVICE)) {
        expect(tagged.has(country), country).toBe(true)
      }
      expect(
        dots.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y))
      ).toBe(true)
    }
    // US mainland: tagged by country boundaries, not a nearby country's centroid.
    expect(
      geography.globeDots.some(
        ([lon, lat, name]) =>
          Number(lon) > -110 &&
          Number(lon) < -90 &&
          Number(lat) > 30 &&
          Number(lat) < 45 &&
          name === 'United States'
      )
    ).toBe(true)
  })
})
