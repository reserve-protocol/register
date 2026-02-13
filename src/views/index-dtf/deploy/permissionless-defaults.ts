import { ChainId } from '@/utils/chains'
import { getPlatformFee } from '@/utils/constants'
import { Address, zeroAddress } from 'viem'
import { DeployInputs, DeployStepId } from './form-fields'

// Fixed vote-lock DAO addresses per chain for permissionless deploys
export const PERMISSIONLESS_VOTE_LOCK: Record<number, Address> = {
  [ChainId.Mainnet]: zeroAddress, // TODO: Real address needed
  [ChainId.Base]: '0xf03426ac429a70fbccda503919b684fa7897a4c9',
  [ChainId.BSC]: zeroAddress, // TODO: Real address needed
}

export const PERMISSIONLESS_READONLY_STEPS = new Set<DeployStepId>([
  'governance',
  'revenue-distribution',
  'auctions',
  'roles',
  'basket-changes',
  'other-changes',
])

// Default operator for permissionless deploys (Reserve team)
const PERMISSIONLESS_OPERATOR =
  '0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4' as const

export const getPermissionlessDefaults = (chainId: number): DeployInputs => {
  const platformFee = getPlatformFee(chainId)

  return {
    tokenName: '',
    symbol: '',
    mandate: '',
    chain: chainId,
    initialValue: 1,
    inputType: 'unit',
    tokensDistribution: [],
    // Governance: use existing DAO
    governanceVoteLock: PERMISSIONLESS_VOTE_LOCK[chainId],
    governanceERC20address: undefined,
    governanceWalletAddress: undefined,
    // Revenue: all to governance after platform fee
    folioFee: 1,
    mintFee: 0.5,
    governanceShare: 100 - platformFee,
    deployerShare: 0,
    fixedPlatformFee: platformFee,
    additionalRevenueRecipients: [],
    // Auctions
    auctionLength: 30,
    weightControl: false,
    // Roles: default operator
    guardians: [PERMISSIONLESS_OPERATOR],
    brandManagers: [PERMISSIONLESS_OPERATOR],
    auctionLaunchers: [PERMISSIONLESS_OPERATOR],
    // Governance settings: defaults
    basketVotingDelay: 48,
    basketVotingPeriod: 72,
    basketVotingThreshold: 0.01,
    basketVotingQuorum: 10,
    basketExecutionDelay: 48,
    governanceVotingDelay: 2,
    governanceVotingPeriod: 3,
    governanceVotingThreshold: 0.01,
    governanceVotingQuorum: 10,
    governanceExecutionDelay: 2,
  }
}
