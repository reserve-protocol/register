import type {
  ProcessError,
  ProcessFolioParams,
  SupportedChainId,
} from '@reserve-protocol/trusted-fillers-sdk'
import type { Address, PublicClient } from 'viem'

// Per sell order; the SDK default skips small DTFs, and CowSwap still decides whether a tiny order fills.
export const COWBOT_MIN_TRADE_VALUE = 1

export const getCowbotParams = ({
  chainId,
  client,
  folioAddress,
  validityDuration,
}: {
  chainId: SupportedChainId
  client: PublicClient
  folioAddress: Address
  validityDuration: number
}): ProcessFolioParams => ({
  chainId,
  client,
  folioAddress,
  validityDuration,
  minTradeValue: COWBOT_MIN_TRADE_VALUE,
  dryRun: false,
})

// A trade below the minimum retries on the next poll, so it is not a failure to show.
export const getReportableCowbotErrors = (errors: ProcessError[]) =>
  errors.filter((error) => error.type !== 'below_min_trade_value')
