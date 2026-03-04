import useIndexDTFList from '@/hooks/useIndexDTFList'
import { useMemo } from 'react'
import { Address } from 'viem'

/**
 * Check if a DTF address is "listed" (shown on discover page).
 * Listed DTFs have external trading bots, so we don't run the in-browser bot.
 */
export const useIsListedDTF = (dtfAddress: Address | undefined) => {
  const { data: listedDTFs, isLoading } = useIndexDTFList()

  const isListed = useMemo(() => {
    if (!dtfAddress || !listedDTFs) return false

    const listedAddresses = new Set(
      listedDTFs.map((d) => d.address.toLowerCase())
    )

    return listedAddresses.has(dtfAddress.toLowerCase())
  }, [dtfAddress, listedDTFs])

  return { isListed, isLoading }
}
