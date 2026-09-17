import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import { folioVersionAtom, indexDTFAtom } from '@/state/dtf/atoms'
import {
  useIndexDtfIdentity,
  useIndexDtfTotalAssets,
  useIndexDtfTotalSupply,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { useReadContracts } from 'wagmi'
import { currentRebalanceAtom } from '../../../atoms'
import { mapToAssets } from '../utils'

export type RebalanceInitialData = {
  supply: bigint
  initialAssets: Record<string, bigint>
}

// Supply and holdings when the proposal was created — the snapshot the
// rebalance math measures progress against. v5/v6 read through the SDK at
// that block; v4 keeps the Register-local multicall.
const useRebalanceInitialData = (): { data: RebalanceInitialData | undefined } => {
  const dtf = useAtomValue(indexDTFAtom)
  const identity = useIndexDtfIdentity()
  const rebalance = useAtomValue(currentRebalanceAtom)
  const versionState = useAtomValue(folioVersionAtom)
  const major = versionState.status === 'ready' ? versionState.major : undefined
  const isSdkVersion = major === 5 || major === 6
  const creationBlock = rebalance?.proposal.creationBlock
  const blockNumber = creationBlock ? BigInt(creationBlock) : undefined
  const sdkParams =
    isSdkVersion && identity.address && blockNumber !== undefined
      ? { ...identity, blockNumber }
      : undefined

  const { data: sdkSupply } = useIndexDtfTotalSupply(sdkParams)
  const { data: sdkAssets } = useIndexDtfTotalAssets(sdkParams)

  const { data: v4Data } = useReadContracts({
    contracts: [
      {
        abi: dtfIndexAbiV4,
        address: dtf?.id,
        functionName: 'totalSupply',
        chainId: dtf?.chainId,
        args: [],
      },
      {
        abi: dtfIndexAbiV4,
        address: dtf?.id,
        functionName: 'totalAssets',
        chainId: dtf?.chainId,
        args: [],
      },
    ],
    blockNumber: blockNumber ?? 0n,
    allowFailure: false,
    query: {
      enabled: blockNumber !== undefined && !!dtf?.id && major === 4,
      select: (data): RebalanceInitialData => {
        const [supply, assetsData] = data as [
          bigint,
          readonly [readonly `0x${string}`[], readonly bigint[]],
        ]
        const [assets, balances] = assetsData

        return { supply, initialAssets: mapToAssets(assets, balances) }
      },
    },
  })

  const data = useMemo(() => {
    if (!isSdkVersion) return v4Data
    if (sdkSupply === undefined || !sdkAssets) return undefined

    return {
      supply: sdkSupply,
      initialAssets: mapToAssets(sdkAssets.tokens, sdkAssets.balances),
    }
  }, [isSdkVersion, v4Data, sdkSupply, sdkAssets])

  return { data }
}

export default useRebalanceInitialData
