import { ChainId } from '@/utils/chains'
import { getPlatformFee } from '@/utils/constants'
import { Address, zeroAddress } from 'viem'
import { DeployInputs, DeployStepId } from './form-fields'

// Fixed vote-lock DAO addresses per chain for permissionless deploys
export const PERMISSIONLESS_VOTE_LOCK: Record<number, Address> = {
  [ChainId.Mainnet]: zeroAddress, // TODO: Real address needed
  [ChainId.Base]: '0xeDAB3789D7D2283214d8F65A6E412B00b1cBfB7a',
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

export const TRUSTED_ADDRESSES: Record<number, string[]> = {
  [ChainId.Mainnet]: [
  ],
  [ChainId.Base]: [
    '0xF2d98377d80DADf725bFb97E91357F1d81384De2',
    '0x1f4b58851cE2F1b2FF906042D32287A0FDF1B899',
    '0x2dc04Aeae96e2f2b642b066e981e80Fe57abb5b2',
    '0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4',
    '0x03d03A026E71979BE3b08D44B01eAe4C5FF9da99'
  ],
  [ChainId.BSC]: [
  ]
}

export const getPermissionlessDefaults = (chainId: number): DeployInputs => {
  const platformFee = getPlatformFee(chainId)

  return {
    tokenName: '',
    symbol: '',
    mandate: '',
    chain: chainId,
    initialValue: 1,
    inputType: 'share',
    tokensDistribution: [],
    // Governance: use existing DAO
    governanceVoteLock: PERMISSIONLESS_VOTE_LOCK[chainId],
    governanceERC20address: undefined,
    governanceWalletAddress: undefined,
    // Fees
    folioFee: 0.15,
    mintFee: 0.15,
    governanceShare: 100 - platformFee,
    deployerShare: 0,
    fixedPlatformFee: platformFee,
    additionalRevenueRecipients: [],
    // Auctions
    auctionLength: 30,
    weightControl: true,
    // Roles: default operator
    guardians: ['0x7f7bf1d0B4bb7395bb68E99e20C732f3AEFFfe47', ...TRUSTED_ADDRESSES[chainId]],
    brandManagers: [], // current wallet
    auctionLaunchers: ['0x7DaAf7Bc2eE8bf4C0ac7f37E6b6cfaEB3ed9a868', ...TRUSTED_ADDRESSES[chainId]],
    // Basket governance (hours)
    basketVotingDelay: 0,
    basketVotingPeriod: 24,
    basketVotingThreshold: 1,
    basketVotingQuorum: 3,
    basketExecutionDelay: 24,
    // Non-basket governance (days)
    governanceVotingDelay: 0,
    governanceVotingPeriod: 1,
    governanceVotingThreshold: 1,
    governanceVotingQuorum: 3,
    governanceExecutionDelay: 1,
    bidsEnabled: true
  }
}
