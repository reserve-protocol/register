import {
  extractIndexDtfDeployedAddress,
  type SupportedChainId,
} from '@reserve-protocol/react-sdk'
import type { Address, Log } from 'viem'

// Only the 6.0.0 deployer's own event counts; other contracts in the tx can emit a look-alike.
export const readDeployedFolio = (
  logs: readonly Log[],
  chainId: number
): { folio?: Address; error?: string } => {
  try {
    return {
      folio: extractIndexDtfDeployedAddress(logs, {
        chainId: chainId as SupportedChainId,
        version: '6.0.0',
      }),
    }
  } catch (error) {
    console.error('[deploy] could not read the deployed Folio', error)
    return { error: error instanceof Error ? error.message : String(error) }
  }
}
