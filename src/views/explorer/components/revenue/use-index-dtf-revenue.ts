import dtfIndexAbi from '@/abis/dtf-index-abi'
import useIndexDTFList, { type IndexDTFItem } from '@/hooks/useIndexDTFList'
import { useMemo, useState } from 'react'
import { formatEther } from 'viem'
import { useReadContracts } from 'wagmi'

export type IndexDTFRevenue = {
  dtf: IndexDTFItem
  pendingFees: bigint
  pendingUsd: number
}

const useIndexDTFRevenue = (): IndexDTFRevenue[] | undefined => {
  const { data: dtfList } = useIndexDTFList()

  const contracts = useMemo(() => {
    if (!dtfList?.length) return []
    return dtfList.map((dtf) => ({
      abi: dtfIndexAbi,
      address: dtf.address,
      functionName: 'getPendingFeeShares' as const,
      chainId: dtf.chainId,
    }))
  }, [dtfList])

  const sequence = useMemo(
    () => contracts.map((call) => `${call.chainId}:${call.address}`).join(','),
    [contracts]
  )

  const { data: feeResults } = useReadContracts({
    contracts,
    query: { enabled: contracts.length > 0 },
  })

  // wagmi keys a multi-chain read by the wallet chain, so a chain switch empties it; the last results stay valid only for the same contracts in the same order.
  const [kept, setKept] = useState<{
    sequence: string
    results: NonNullable<typeof feeResults>
  }>()
  if (feeResults && kept?.results !== feeResults) {
    setKept({ sequence, results: feeResults })
  }
  const results =
    feeResults ?? (kept?.sequence === sequence ? kept.results : undefined)

  return useMemo(() => {
    if (!dtfList?.length || !results) return undefined

    const items: IndexDTFRevenue[] = []

    for (let i = 0; i < dtfList.length; i++) {
      const dtf = dtfList[i]
      const result = results[i]
      if (result?.status !== 'success') continue

      const pendingFees = result.result as bigint
      const pendingTokens = Number(formatEther(pendingFees))
      const pendingUsd = pendingTokens * (dtf.price ?? 0)

      items.push({ dtf, pendingFees, pendingUsd })
    }

    return items.sort((a, b) => b.pendingUsd - a.pendingUsd)
  }, [dtfList, results])
}

export default useIndexDTFRevenue
