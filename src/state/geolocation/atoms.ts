import { atom } from 'jotai'
import { atomWithLoadable } from 'utils/atoms/utils'
import { BLOCKED_COLLATERALS, BLOCKED_COUNTRIES } from '.'
import { rTokenCollateralStatusAtom, rTokenStateAtom } from 'state/atoms'

const cloudflareFallbackURLs = [
  'https://one.one.one.one/cdn-cgi/trace',
  'https://1.0.0.1/cdn-cgi/trace',
  'https://cloudflare-dns.com/cdn-cgi/trace',
  'https://cloudflare-eth.com/cdn-cgi/trace',
  'https://cloudflare-ipfs.com/cdn-cgi/trace',
  'https://workers.dev/cdn-cgi/trace',
  'https://pages.dev/cdn-cgi/trace',
  'https://cloudflare.tv/cdn-cgi/trace',
]

async function fetchWithFallback(links: string[]) {
  let response
  for (let link of links) {
    try {
      response = await fetch(link)
      if (response.ok) return response
    } catch (e) {}
  }
  return response
}

export const geolocationAtom = atomWithLoadable(async () => {
  try {
    let response = await fetchWithFallback(cloudflareFallbackURLs)

    if (!response) {
      throw new Error('No response')
    }

    const data = await response.text()
    let arr = data
      .trim()
      .split('\n')
      .map((e) => e.split('='))
    return Object.fromEntries(arr).loc as string
  } catch (e) {
    console.warn('Failed to get client location')
    return null
  }
})

export const isRTokenMintOrStakeEnabled = atom((get) => {
  const loc = get(geolocationAtom)
  const rTokenCollaterals = Object.keys(
    get(rTokenCollateralStatusAtom) ?? {}
  ).map((c) => c.toLowerCase())

  if (!loc) {
    return { loading: true, value: false }
  }

  if (
    BLOCKED_COUNTRIES.indexOf(loc) !== -1 &&
    BLOCKED_COLLATERALS.some((e) => rTokenCollaterals.includes(e.toLowerCase()))
  ) {
    return { loading: false, value: false }
  }

  return { loading: false, value: true }
})
