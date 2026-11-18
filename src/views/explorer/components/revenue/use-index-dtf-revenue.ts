import dtfIndexAbi from '@/abis/dtf-index-abi'
import useIndexDTFList, { type IndexDTFItem } from '@/hooks/useIndexDTFList'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { formatEther } from 'viem'
import { useConfig } from 'wagmi'
import { readContracts } from 'wagmi/actions'

export type IndexDTFRevenue = {
  dtf: IndexDTFItem
  pendingFees: bigint
  pendingUsd: number
}

const feeKey = (dtf: Pick<IndexDTFItem, 'address' | 'chainId'>) =>
  `${dtf.chainId}:${dtf.address.toLowerCase()}`

const useIndexDTFRevenue = (): IndexDTFRevenue[] | undefined => {
  const config = useConfig()
  const { data: dtfList } = useIndexDTFList()

  // Sorted, so the catalog can reorder by market cap without a new read.
  const targets = useMemo(
    () =>
      (dtfList ?? [])
        .map((dtf) => ({ key: feeKey(dtf), dtf }))
        .sort((a, b) => a.key.localeCompare(b.key)),
    [dtfList]
  )

  // WHY: wagmi's `useReadContracts` keys a multi-chain read by the wallet chain, so a chain switch read everything again and remounted the rows.
  const { data: pendingFees } = useQuery({
    queryKey: ['explorer-index-dtf-pending-fees', targets.map(({ key }) => key)],
    queryFn: async () => {
      const results = await readContracts(config, {
        allowFailure: true,
        contracts: targets.map(({ dtf }) => ({
          abi: dtfIndexAbi,
          address: dtf.address,
          functionName: 'getPendingFeeShares' as const,
          chainId: dtf.chainId,
        })),
      })

      const fees: Record<string, bigint> = {}
      results.forEach((result, index) => {
        if (result.status === 'success') {
          fees[targets[index].key] = result.result as bigint
        }
      })
      return fees
    },
    enabled: targets.length > 0,
    // Fees are stored by DTF, so the previous read stays correct for every DTF it has while a changed list loads.
    placeholderData: keepPreviousData,
  })

  return useMemo(() => {
    if (!dtfList?.length || !pendingFees) return undefined

    const items: IndexDTFRevenue[] = []

    for (const dtf of dtfList) {
      const fees = pendingFees[feeKey(dtf)]
      if (fees === undefined) continue

      const pendingTokens = Number(formatEther(fees))
      const pendingUsd = pendingTokens * (dtf.price ?? 0)

      items.push({ dtf, pendingFees: fees, pendingUsd })
    }

    return items.sort((a, b) => b.pendingUsd - a.pendingUsd)
  }, [dtfList, pendingFees])
}

export default useIndexDTFRevenue
