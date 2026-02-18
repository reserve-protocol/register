import { Address } from 'viem'

export type CowbotStatus =
  | 'idle'
  | 'initializing'
  | 'running'
  | 'error'
  | 'external'

export type SupportedChainId = 1 | 8453 | 56

export interface CowbotConfig {
  /** DTF/Folio address */
  folioAddress: Address
  /** Chain ID (1 = Ethereum, 8453 = Base, 56 = BSC) */
  chainId: number
  /** Is there an active auction? */
  isAuctionActive: boolean
  /** Is this a "listed" DTF with external bot? */
  isListedDTF: boolean
  /** Polling interval in ms (default: 30000) */
  pollingInterval?: number
  /** Order validity duration in seconds (default: 120) */
  validityDuration?: number
}

// Re-export SDK types
export type {
  ProcessFolioResult,
  SubmittedOrder,
  PreparedOrder,
  SubmitOrderResult,
  ProcessError,
} from '@reserve-protocol/trusted-fillers-sdk'
