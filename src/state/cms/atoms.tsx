import { atom } from 'jotai'
import { AddressMap } from 'types'

export interface ProjectMetadata {
  name: string
  description: string
  docs: string
  website: string
  logo?: string
  color?: string
}

export interface UnderlyingMetadata {
  symbol: string
  addresses: AddressMap
  color: string
  description: string
  rating?: string
  website?: string
}

export interface CollateralMetadata {
  id: string
  name: string
  displaySymbol: string
  description?: string
  llamaId?: string
  color: string
  tokenDistribution?: { token: string; distribution: number }[]
  underlying: Record<string, UnderlyingMetadata>
  protocol: ProjectMetadata
}

export const collateralsMetadataAtom = atom<Record<
  string,
  CollateralMetadata
> | null>(null)
