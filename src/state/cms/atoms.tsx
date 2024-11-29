import { atom } from 'jotai'
import { AddressMap } from 'types'

export interface ProjectMetadata {
  id: string
  name: string
  description: string
  docs: string
  website: string
  logo?: string
  color?: string
}

export interface TokenMetadata {
  symbol: string
  name: string
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
  underlying: Record<string, TokenMetadata>
  protocol: ProjectMetadata
}

// isLoading = null
// TODO: Terrible memory efficiency, data should be normalized and then provide a getter atom that returns the collection
export const collateralsMetadataAtom = atom<Record<
  string,
  CollateralMetadata
> | null>(null)

export const protocolMetadataAtom = atom<Record<
  string,
  ProjectMetadata
> | null>(null)

export const tokenMetadataAtom = atom<Record<string, TokenMetadata> | null>(
  null
)
