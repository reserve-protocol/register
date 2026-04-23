import { IndexDTF } from '@/types'
import { Address } from 'viem'

type Governance =
  | NonNullable<IndexDTF['ownerGovernance']>
  | NonNullable<IndexDTF['tradingGovernance']>
  | NonNullable<NonNullable<IndexDTF['stToken']>['governance']>

export const getDTFSettingsGovernance = (dtf?: IndexDTF) => {
  return dtf?.ownerGovernance ?? dtf?.tradingGovernance
}

export const getGovernanceVoteTokenAddress = (
  governance?: Governance,
  fallback?: Address
) => {
  return governance?.token?.token.address ?? fallback
}

export const getGovernanceByAddress = (
  dtf: IndexDTF | undefined,
  address: Address | string | undefined
) => {
  if (!dtf || !address) return undefined

  const normalizedAddress = address.toLowerCase()
  const governances = [
    dtf.ownerGovernance,
    dtf.tradingGovernance,
    dtf.stToken?.governance,
  ].filter(Boolean) as Governance[]

  return governances.find(
    (governance) => governance.id.toLowerCase() === normalizedAddress
  )
}
