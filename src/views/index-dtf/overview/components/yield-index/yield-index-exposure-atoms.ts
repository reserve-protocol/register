import { chainIdAtom } from '@/state/atoms'
import {
  indexDTFAssetsAtom,
  indexDTFPoolsDataAtom,
} from '@/state/dtf/yield-index-atoms'
import { atom } from 'jotai'

export const underlyingTokensAtom = atom<
  { symbol: string; address: string; chain: number }[]
>((get) => {
  const assets = get(indexDTFAssetsAtom)
  const chainId = get(chainIdAtom)
  if (!assets) return []
  const seen = new Set<string>()
  return assets
    .filter((a) => {
      if (seen.has(a.address)) return false
      seen.add(a.address)
      return true
    })
    .map((a) => ({ symbol: a.symbol, address: a.address, chain: chainId }))
})

export const protocolSlugsAtom = atom<{ project: string }[]>((get) => {
  const pools = get(indexDTFPoolsDataAtom)
  if (!pools) return []
  const seen = new Set<string>()
  const out: { project: string }[] = []
  for (const p of pools) {
    if (!seen.has(p.project)) {
      seen.add(p.project)
      out.push({ project: p.project })
    }
    if (p.poolMeta) {
      const slug = p.poolMeta.toLowerCase().includes('uniswap')
        ? 'uniswap-v3'
        : p.poolMeta.toLowerCase()
      if (!seen.has(slug)) {
        seen.add(slug)
        out.push({ project: slug })
      }
    }
  }
  return out
})

export const uniqueProjectsCountAtom = atom<number>((get) => {
  const pools = get(indexDTFPoolsDataAtom)
  if (!pools) return 0
  const projects = new Set<string>()
  for (const p of pools) {
    projects.add(p.project)
    if (p.poolMeta) {
      const venue = p.poolMeta.replace(/V\d+/g, '').trim().toLowerCase()
      projects.add(venue)
    }
  }
  return projects.size
})
