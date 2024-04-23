import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { VERSION } from 'utils/constants'
import { Address } from 'viem'
import rTokenAtom from './rTokenAtom'
import rTokenBackingDistributionAtom from './rTokenBackingDistributionAtom'
import rTokenContractsAtom from './rTokenContractsAtom'
import rTokenRevenueSplitAtom from './rTokenRevenueSplitAtom'

export const rTokenStateAtom = atomWithReset({
  tokenSupply: 0,
  basketsNeeded: 0,
  stTokenSupply: 0,
  exchangeRate: 0,
  issuanceAvailable: 0,
  issuanceThrottleAmount: 0,
  issuanceThrottleRate: 0,
  redemptionAvailable: 0,
  redemptionThrottleAmount: 0,
  redemptionThrottleRate: 0,
  basketNonce: 0,
  isCollaterized: true,
  tradingPaused: false,
  issuancePaused: false,
  frozen: false,
})

// TODO: Depure atoms
// TODO: Prices atoms?
export const rsrPriceAtom = atom(0)
export const rTokenPriceAtom = atom(0)

export const maxIssuanceAtom = atom(0)
export const maxRedemptionAtom = atom(0)

// TODO: Temporal until migration is finish
export const isModuleLegacyAtom = atom((get) => {
  const contracts = get(rTokenContractsAtom)

  return {
    main: contracts?.main?.version[0] !== VERSION[0],
    issuance: contracts?.token?.version[0] !== VERSION[0],
    staking: contracts?.stRSR?.version[0] !== VERSION[0],
    auctions: contracts?.rTokenTrader?.version[0] !== VERSION[0],
    trading:
      // Assumes no .1x> versions
      Number(contracts?.rTokenTrader?.version.replaceAll('.', '')) <= 340,
  }
})

// Track collateral status
export const rTokenCollateralStatusAtom = atom<{ [x: string]: 0 | 1 | 2 }>({})

export const rTokenBasketStatusAtom = atom((get) => {
  const status = get(rTokenCollateralStatusAtom)

  if (!Object.keys(status).length) {
    return 0
  }

  return Math.max(...Object.values(status))
})

export const rTokenGovernanceAtom = atomWithReset<{
  name: string
  governor?: Address
  timelock?: Address
  votingDelay?: string
  votingPeriod?: string
  executionDelay?: string
  proposalThreshold?: string
  quorumDenominator?: string
  quorumNumerator?: string
  quorumVotes?: string
  guardians?: string[]
  version?: string
}>({
  name: 'Custom',
})

// Token APY
export const rTokenYieldAtom = atom({ tokenApy: 0, stakingApy: 0 })

export const rTokenTradingAvailableAtom = atom((get) => {
  const { tradingPaused, frozen } = get(rTokenStateAtom)

  return !tradingPaused && !frozen
})

// Get rToken main contract, not available for RSV
export const rTokenMainAtom = atom<string | null>((get) => {
  const rToken = get(rTokenAtom)

  return rToken?.main || null
})

export const rTokenManagersAtom = atom({
  owners: [] as string[],
  pausers: [] as string[],
  freezers: [] as string[],
  longFreezers: [] as string[],
})

// Yield

// 30 day avg apy taken from https://defillama.com/yields?token=USDT&token=CUSDT&token=USDC&token=CUSDC&token=DAI&token=BUSD&token=USDP&token=WBTC&token=ETH&project=aave-v2&project=compound&chain=Ethereum
export const collateralYieldAtom = atom<{ [x: string]: number }>({})

export const estimatedApyAtom = atom((get) => {
  const rToken = get(rTokenAtom)
  const { tokenSupply, stTokenSupply, exchangeRate } = get(rTokenStateAtom)
  const collateralYield = get(collateralYieldAtom)
  const distribution = get(rTokenBackingDistributionAtom)
  const revenueSplit = get(rTokenRevenueSplitAtom)
  const rTokenPrice = get(rTokenPriceAtom)
  const rsrPrice = get(rsrPriceAtom)
  const apys = {
    stakers: 0,
    holders: 0,
    basket: 0,
  }

  if (!rToken?.main || !tokenSupply || !revenueSplit || !distribution) {
    return apys
  }

  let rTokenYield = 0

  for (const collateral of rToken.collaterals) {
    rTokenYield +=
      (collateralYield[collateral.symbol.toLowerCase()] || 0) *
      (distribution.collateralDistribution[collateral.address]?.share / 100 ||
        0)
  }
  const supplyUsd = tokenSupply * rTokenPrice
  const stakeUsd = stTokenSupply * exchangeRate * rsrPrice
  const holdersShare = +(revenueSplit.holders || 0) / 100
  const stakersShare = +(revenueSplit.stakers || 0) / 100

  apys.holders = rTokenYield * holdersShare
  apys.stakers = stTokenSupply
    ? ((rTokenYield * supplyUsd) / stakeUsd) * stakersShare
    : rTokenYield * stakersShare
  apys.basket = rTokenYield

  return apys
})

export const rTokenMetricsAtom = atom({
  totalValueLockedUSD: '$0',
  totalRTokenUSD: '$0',
  cumulativeVolumeUSD: '$0',
  cumulativeRTokenRevenueUSD: '$0',
  cumulativeStakingRevenueUSD: '$0',
  transactionCount: '0',
  dailyTransactionCount: '0',
  dailyVolume: '$0',
})
