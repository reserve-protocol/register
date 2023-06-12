import { BackupBasket, Basket } from 'components/rtoken-setup/atoms'
import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import rTokenRevenueSplitAtom from 'state/rtoken/atoms/rTokenRevenueSplitAtom'
import rTokenContractsAtom from '../rtoken/atoms/rTokenContractsAtom'
import rTokenBackingDistributionAtom from '../rtoken/atoms/rTokenBackingDistributionAtom'
import rTokenAtom from '../rtoken/atoms/rTokenAtom'
import { VERSION } from 'utils/constants'

// TODO: Prices atoms?
export const rsrPriceAtom = atom(0)
export const rTokenPriceAtom = atom(0)

export const rsrExchangeRateAtom = atom(1)
export const maxIssuanceAtom = atom(0)
export const maxRedemptionAtom = atom(0)

// TODO: Temporal until migration is finish
export const isModuleLegacyAtom = atom((get) => {
  const contracts = get(rTokenContractsAtom)

  return {
    main: contracts?.main?.version !== VERSION,
    issuance: contracts?.token?.version !== VERSION,
    staking: contracts?.stRSR?.version !== VERSION,
    auctions: contracts?.rTokenTrader?.version !== VERSION,
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

export const basketNonceAtom = atom(0)

export const rTokenGovernanceAtom = atomWithReset<{
  name: string
  governor: string
  timelock?: string
  votingDelay?: string
  votingPeriod?: string
  executionDelay?: string
  proposalThreshold?: string
  quorumDenominator?: string
  quorumNumerator?: string
  quorumVotes?: string
  guardians?: string[]
}>({
  name: 'Custom',
  governor: '',
})

export const stRSRSupplyAtom = atom('')
export const rTokenTotalSupplyAtom = atom('')
export const rTokenBasketAtom = atomWithReset<Basket>({})
export const rTokenBackupAtom = atomWithReset<BackupBasket>({})
export const rTokenCollaterizedAtom = atom(true)

// Token APY
export const rTokenYieldAtom = atom({ tokenApy: 0, stakingApy: 0 })

// Current rToken status
// - `tradingPaused`: all interactions disabled EXCEPT ERC20 functions + RToken.issue + RToken.redeem + StRSR.stake + StRSR.payoutRewards
// - `issuancePaused`: all interactions enabled EXCEPT RToken.issue
// - `frozen`: all interactions disabled EXCEPT ERC20 functions + StRSR.stake
export const rTokenStatusAtom = atomWithReset({
  tradingPaused: false,
  issuancePaused: false,
  frozen: false,
})

export const rTokenTradingAvailableAtom = atom((get) => {
  const { tradingPaused, frozen } = get(rTokenStatusAtom)

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
export const collateralYieldAtom = atom<{ [x: string]: number }>({
  sadai: 1.61,
  sausdc: 1.94,
  sausdt: 2.98,
  sausdp: 3.37,
  cdai: 2.21,
  cusdc: 2.47,
  cusdt: 2.51,
  cusdp: 0.31,
  cwbtc: 0.03,
  ceth: 0.07,
  fusdc: 3.46,
  fdai: 3.76,
  fusdt: 3.74,
  wsteth: 5,
  reth: 4.12,
  wcUSDCv3: 2.1,
  'stkcvxeusd3crv-f': 17.06,
})

export const estimatedApyAtom = atom((get) => {
  const rToken = get(rTokenAtom)
  const supply = +get(rTokenTotalSupplyAtom) || 0
  const staked = +get(stRSRSupplyAtom) || 0
  const collateralYield = get(collateralYieldAtom)
  const distribution = get(rTokenBackingDistributionAtom)
  const revenueSplit = get(rTokenRevenueSplitAtom)
  const rTokenPrice = get(rTokenPriceAtom)
  const rsrPrice = get(rsrPriceAtom)
  const apys = {
    stakers: 0,
    holders: 0,
  }

  if (!rToken?.main || !supply || !revenueSplit || !distribution) {
    return apys
  }

  let rTokenYield = 0

  for (const collateral of rToken.collaterals) {
    rTokenYield +=
      (collateralYield[collateral.symbol.toLowerCase()] || 0) *
      (distribution.collateralDistribution[collateral.address]?.share / 100 ||
        0)
  }

  apys.holders = rTokenYield * (+(revenueSplit.holders || 0) / 100)
  apys.stakers = staked
    ? ((rTokenYield * (supply * rTokenPrice)) / (staked * rsrPrice)) *
      ((+revenueSplit.stakers || 0) / 100)
    : (rTokenYield * (+revenueSplit.stakers || 0)) / 100

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
