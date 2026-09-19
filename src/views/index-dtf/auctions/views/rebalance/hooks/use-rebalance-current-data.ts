import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import { folioVersionAtom, indexDTFAtom } from '@/state/dtf/atoms'
import { FolioVersion } from '@reserve-protocol/dtf-rebalance-lib'
import { Rebalance as RebalanceV4 } from '@reserve-protocol/dtf-rebalance-lib/dist/4.0.0/types'
import { Rebalance as RebalanceV5 } from '@reserve-protocol/dtf-rebalance-lib/dist/types'
import {
  useIndexDtfCurrentRebalance,
  useIndexDtfIdentity,
  type IndexDtfCurrentRebalanceState,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { useReadContracts } from 'wagmi'
import { mapToAssets } from '../utils'
import { isAuctionOngoingAtom } from '../atoms'
import {
  FOLIO_VERSION_V4,
  FOLIO_VERSION_V5,
  FOLIO_VERSION_V6,
} from '../utils/transforms'
import { transformV4Rebalance } from '../utils/transforms'

export type RebalanceCurrentData = {
  supply: bigint
  rebalance: RebalanceV4 | RebalanceV5
  currentAssets: Record<string, bigint>
  folioVersion: FolioVersion
  bidsEnabled: boolean
}

export const AUCTION_POLL_MS = 10_000

// Stable identities so React Query memoizes the selection.
const selectCurrentData =
  (folioVersion: FolioVersion) =>
  (state: IndexDtfCurrentRebalanceState): RebalanceCurrentData => ({
    supply: state.totalSupply,
    rebalance: state.rebalance,
    currentAssets: mapToAssets(
      state.totalAssets.tokens,
      state.totalAssets.balances
    ),
    folioVersion,
    bidsEnabled: state.rebalance.bidsEnabled,
  })
const selectCurrentDataV5 = selectCurrentData(FOLIO_VERSION_V5)
const selectCurrentDataV6 = selectCurrentData(FOLIO_VERSION_V6)

// v5 and v6 share the getRebalance shape and come through the SDK; v4 stays on
// the Register-local read by decision. Nothing reads until the version resolves.
const useRebalanceCurrentData = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const identity = useIndexDtfIdentity()
  const versionState = useAtomValue(folioVersionAtom)
  const isAuctionOngoing = useAtomValue(isAuctionOngoingAtom)
  const major = versionState.status === 'ready' ? versionState.major : undefined
  const isSdkVersion = major === 5 || major === 6
  const refetchInterval = isAuctionOngoing ? AUCTION_POLL_MS : false

  const sdkQuery = useIndexDtfCurrentRebalance(
    isSdkVersion && identity.address ? identity : undefined,
    {
      refetchInterval,
      select: major === 6 ? selectCurrentDataV6 : selectCurrentDataV5,
    }
  )

  const v4Query = useReadContracts({
    contracts: [
      {
        abi: dtfIndexAbiV4,
        address: dtf?.id,
        functionName: 'totalSupply',
        chainId: dtf?.chainId,
      },
      {
        abi: dtfIndexAbiV4,
        address: dtf?.id,
        functionName: 'getRebalance',
        chainId: dtf?.chainId,
      },
      {
        abi: dtfIndexAbiV4,
        address: dtf?.id,
        functionName: 'totalAssets',
        args: [],
        chainId: dtf?.chainId,
      },
    ],
    allowFailure: false,
    query: {
      enabled: !!dtf?.id && major === 4,
      refetchInterval,
      select: (data): RebalanceCurrentData => {
        const [supply, rebalanceRaw, assetsData] = data as unknown as [
          bigint,
          readonly unknown[],
          readonly [readonly `0x${string}`[], readonly bigint[]],
        ]
        const [assets, balances] = assetsData

        return {
          supply,
          rebalance: transformV4Rebalance(rebalanceRaw),
          currentAssets: mapToAssets(assets, balances),
          folioVersion: FOLIO_VERSION_V4,
          bidsEnabled: true,
        }
      },
    },
  })

  return isSdkVersion ? sdkQuery : v4Query
}

export default useRebalanceCurrentData
