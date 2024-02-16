import { atom } from 'jotai'
import { AddressMap } from 'types'

export interface ProjectMetadata {
  name: string
  description: string
  docs: string
  website: string
  logo?: string
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
  llamaId?: string
  color: string
  tokenDistribution?: { token: string; distribution: number }[]
  underlying: UnderlyingMetadata[]
  protocol: ProjectMetadata
}

// isLoading = null
// TODO: Terrible memory efficiency, data should be normalized and then provide a getter atom that returns the collection
export const collateralsMetadataAtom = atom<Record<
  string,
  CollateralMetadata
> | null>(null)

// TODO: Add earn cms related data here
