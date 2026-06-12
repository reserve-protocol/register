import { isAddress } from '@/utils'
import type { Address } from 'viem'

type IndexCatalogEntry = {
  address: string
  chainId: number
  symbol: string
}

export const resolveIndexDtfRouteToken = ({
  catalog,
  chainId,
  tokenId,
}: {
  catalog: readonly IndexCatalogEntry[]
  chainId: number
  tokenId: string | undefined
}): Address | null => {
  if (!tokenId) return null

  const address = isAddress(tokenId)
  if (address) return address

  const routeToken = tokenId.trim().toLowerCase()
  if (!routeToken) return null

  const dtf = catalog.find(
    (entry) =>
      entry.chainId === chainId && entry.symbol.toLowerCase() === routeToken
  )

  return dtf ? isAddress(dtf.address) : null
}
