import dtfIndexDeployerAbi from '@/abis/dtf-index-deployer-abi'
import {
  INDEX_DTF_DEPLOYER_ADDRESS,
  INDEX_DTF_V6_DEPLOYER_ADDRESS,
} from '@reserve-protocol/react-sdk'
import { type Address, type Log, isAddressEqual, parseEventLogs } from 'viem'

export type DeployEventName = 'FolioDeployed' | 'GovernedFolioDeployed'

// Any contract in the tx (e.g. a basket token during transferFrom) can emit a look-alike event; only the deployer's log counts.
export const getDeployedFolio = (
  logs: Log[],
  eventName: DeployEventName,
  deployers: readonly Address[]
): Address | undefined => {
  const events = parseEventLogs({
    abi: dtfIndexDeployerAbi,
    logs,
    eventName,
  }).filter((event) =>
    deployers.some((deployer) => isAddressEqual(event.address, deployer))
  )

  return events.length === 1 ? events[0].args.folio : undefined
}

// The zapper picks the deployer server-side, so its route can only be held to Reserve's own deployers.
export const getReserveDeployers = (chainId: number): Address[] => {
  const key = chainId as keyof typeof INDEX_DTF_DEPLOYER_ADDRESS
  if (!(key in INDEX_DTF_DEPLOYER_ADDRESS)) return []
  return [INDEX_DTF_DEPLOYER_ADDRESS[key], INDEX_DTF_V6_DEPLOYER_ADDRESS[key]]
}
