import {
  useIndexDtfVoteLockPreviewRedeem,
  type SupportedChainId,
} from '@reserve-protocol/react-sdk'
import { formatUnits, parseUnits, type Address } from 'viem'

// Account-less assets-per-share rate via previewRedeem(1 share). Exact 1 for
// legacy vaults, >1 for self-appreciating ones (vlRSR). Display-only — exact
// conversions must use previewRedeem/maxWithdraw on the real amount. The drip
// moves slowly; a 30s interval keeps on-screen values ticking without spam.
export const useVoteLockExchangeRate = (params?: {
  stToken: Address
  chainId: SupportedChainId
  shareDecimals: number
  underlyingDecimals: number
}) => {
  const { data: rateRaw, isError } = useIndexDtfVoteLockPreviewRedeem(
    params
      ? {
          stToken: params.stToken,
          chainId: params.chainId,
          shares: parseUnits('1', params.shareDecimals),
        }
      : undefined,
    { staleTime: 30_000, refetchInterval: 30_000 }
  )

  return {
    rateRaw,
    isError,
    rate:
      params && rateRaw !== undefined
        ? Number(formatUnits(rateRaw, params.underlyingDecimals))
        : undefined,
  }
}
