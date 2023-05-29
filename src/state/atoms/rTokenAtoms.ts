import {
  BackupBasket,
  Basket,
  RevenueSplit,
} from 'components/rtoken-setup/atoms'
import { atom } from 'jotai'
import { atomWithReset, atomWithStorage } from 'jotai/utils'
import { ReserveToken, StringMap, Token } from 'types'
import rTokenAtom from '../rtoken/atoms/rTokenAtom'
import rTokenRevenueSplitAtom from 'state/rtoken/atoms/rTokenRevenueSplitAtom'

// Store rToken meta into localStorage for fast fetching using cache
export const reserveTokensAtom = atomWithStorage<{
  [x: string]: ReserveToken
}>('reserveTokens', {})

// TODO: Prices atoms?
export const rsrPriceAtom = atom(0)

export const rTokenPriceAtom = atom(0)
export const rsrExchangeRateAtom = atom(1)
export const maxIssuanceAtom = atom(0)
export const maxRedemptionAtom = atom(0)

// TODO: Temporal measure - track collateral status
export const rTokenCollateralAssetsAtom = atom<string[]>([])
export const rTokenCollateralStatusAtom = atom<{ [x: string]: 0 | 1 | 2 }>({})

export const rTokenBasketStatusAtom = atom((get) => {
  const status = get(rTokenCollateralStatusAtom)

  if (!Object.keys(status).length) {
    return 0
  }

  return Math.max(...Object.values(status))
})

export const basketNonceAtom = atom(0)

export const rTokenParamsAtom = atomWithReset({
  tradingDelay: '',
  backingBuffer: '',
  maxTradeSlippage: '',
  minTrade: '',
  rewardRatio: '',
  unstakingDelay: '',
  auctionLength: '',
  issuanceThrottleAmount: '',
  issuanceThrottleRate: '',
  redemptionThrottleAmount: '',
  redemptionThrottleRate: '',
  shortFreeze: '',
  longFreeze: '',
  maxTrade: '',
})

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
export const rTokenStatusAtom = atomWithReset({
  paused: false,
  issuancePaused: false,
  redemptionPaused: false,
  frozen: false,
})
export const isRTokenDisabledAtom = atom<boolean>((get) => {
  const status = get(rTokenStatusAtom)

  return status.paused || status.frozen
})

// Get rToken main contract, not available for RSV
export const rTokenMainAtom = atom<string | null>((get) => {
  const rToken = get(rTokenAtom)

  return rToken?.main || null
})

export const rTokenCollateralDist = atom<{
  [x: string]: { share: number; targetUnit: string }
}>({})

// Get rToken collateral distribution
export const rTokenDistributionAtom = atom<{
  backing: number
  staked: number
}>({
  backing: 0,
  staked: 0,
})

export const rTokenManagersAtom = atom({
  owners: [] as string[],
  pausers: [] as string[],
  freezers: [] as string[],
  longFreezers: [] as string[],
})

export const rTokenGuardiansAtom = atom([] as string[])

// Yield

// 30 day avg apy taken from https://defillama.com/yields?token=USDT&token=CUSDT&token=USDC&token=CUSDC&token=DAI&token=BUSD&token=USDP&token=WBTC&token=ETH&project=aave-v2&project=compound&chain=Ethereum
// TODO: Fetch this list directly from defillama
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
  const distribution = get(rTokenCollateralDist)
  const revenueSplit = get(rTokenRevenueSplitAtom)
  const rTokenPrice = get(rTokenPriceAtom)
  const rsrPrice = get(rsrPriceAtom)
  const apys = {
    stakers: 0,
    holders: 0,
  }

  if (!rToken?.main || !supply || !revenueSplit) {
    return apys
  }

  let rTokenYield = 0

  for (const collateral of rToken.collaterals) {
    rTokenYield +=
      (collateralYield[collateral.symbol.toLowerCase()] || 0) *
      (distribution[collateral.address]?.share / 100 || 0)
  }

  apys.holders = rTokenYield * (+(revenueSplit.holders || 0) / 100)
  apys.stakers = staked
    ? ((rTokenYield * (supply * rTokenPrice)) / (staked * rsrPrice)) *
      ((+revenueSplit.stakers || 0) / 100)
    : (rTokenYield * (+revenueSplit.stakers || 0)) / 100

  return apys
})

// Metrics

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

// Asset registry
export const rTokenAssetsAtom = atom<{
  [x: string]: {
    token: Token
    priceUsd: number
  }
}>({})

export const rTokenAssetERC20MapAtom = atom((get) => {
  const assets = get(rTokenAssetsAtom)

  return Object.keys(assets).reduce((map, assetKey) => {
    map[assets[assetKey].token.address] = assetKey

    return map
  }, {} as { [x: string]: string })
})

// TODO: Fetch state atom
// {
//   abi: BasketHandlerInterface,
//   address: basketHandler,
//   args: [],
//   method: 'fullyCollateralized',
// },

// setBackingCollateralStatus(isCollaterized)
