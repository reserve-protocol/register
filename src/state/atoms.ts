import { CHAIN_ID } from 'utils/chains'
/**
 * This file contains application level atoms
 * At some point this file is expected to be divided into multiple files per atom type
 */
import { BigNumber } from '@ethersproject/bignumber'
import { atom } from 'jotai'
import { atomWithReset, atomWithStorage, createJSONStorage } from 'jotai/utils'
import {
  AccountPosition,
  AccountToken,
  BalanceMap,
  MulticallState,
  RawCall,
  ReserveToken,
  StringMap,
  TransactionMap,
  TransactionState,
} from 'types'
import { COLLATERAL_STATUS, RSR, TRANSACTION_STATUS } from 'utils/constants'
import { WalletTransaction } from './../types/index'
import {
  BackupBasket,
  Basket,
  RevenueSplit,
} from 'components/rtoken-setup/atoms'

/**
 * ######################
 * ? Utility to clean-up storage in case of breaking changes
 * ######################
 */
const VERSION = '1'

if (
  !localStorage.getItem('version') ||
  localStorage.getItem('version') !== VERSION
) {
  localStorage.clear()
  localStorage.setItem('version', VERSION)
}

/**
 * ######################
 * ? RToken related atoms
 * ######################
 */

// Store rToken meta into localStorage for fast fetching using cache
export const reserveTokensAtom = atomWithStorage<{
  [x: string]: ReserveToken
}>('reserveTokens', {})

// Current selected rToken address
export const selectedRTokenAtom = atom('')

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

// RToken related contracts
export const rTokenContractsAtom = atomWithReset<StringMap>({
  main: '',
  backingManager: '',
  rTokenTrader: '',
  rsrTrader: '',
  broker: '',
  assetRegistry: '',
  stRSR: '',
  furnace: '',
  rTokenAsset: '',
  distributor: '',
  basketHandler: '',
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

export const rTokenBasketAtom = atomWithReset<Basket>({})
export const rTokenBackupAtom = atomWithReset<BackupBasket>({})
export const rTokenRevenueSplitAtom = atomWithReset<RevenueSplit>({
  holders: '0', // %
  stakers: '0', // %
  external: [],
})
export const rTokenCollaterizedAtom = atom(true)

// Grab rToken data from the atom list
export const rTokenAtom = atom<ReserveToken | null>((get) =>
  get(reserveTokensAtom) && get(reserveTokensAtom)[get(selectedRTokenAtom)]
    ? get(reserveTokensAtom)[get(selectedRTokenAtom)]
    : null
)

// Token APY
export const rTokenYieldAtom = atom({ tokenApy: 0, stakingApy: 0 })

// Current rToken status
export const rTokenStatusAtom = atom({ paused: false, frozen: false })
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

/**
 * ##############################
 * ? Wallet/Account related atoms
 * ##############################
 */

// Tracks walletModal visible status
export const isWalletModalVisibleAtom = atom(false)

// Tracks current account role related to the selected rToken
export const accountRoleAtom = atom({
  owner: false,
  pauser: false,
  shortFreezer: false,
  longFreezer: false,
})

/**
 * #########################
 * Chain state related atoms
 * #########################
 */
export const chainIdAtom = atom<number | undefined>(CHAIN_ID)
export const blockAtom = atom<number | undefined>(undefined)
export const blockTimestampAtom = atom<number>(0)

/**
 * ##################
 * Price related atom
 * ##################
 */

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
})

export const ethPriceAtom = atom(1)
export const rsrPriceAtom = atom(0)
export const btcPriceAtom = atom(0)
export const eurPriceAtom = atom(0)
export const gasPriceAtom = atom(0)
export const rTokenPriceAtom = atom(0)
export const rsrExchangeRateAtom = atom(1)
export const maxIssuanceAtom = atom(0)
export const maxRedemptionAtom = atom(0)
export const rTokenTotalSupplyAtom = atom('')
export const stRSRSupplyAtom = atom('')

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

  if (!rToken || !supply || rToken.isRSV) {
    return apys
  }

  let rTokenYield = 0

  for (const collateral of rToken.collaterals) {
    rTokenYield +=
      (collateralYield[collateral.symbol.toLowerCase()] || 0) *
      (distribution[collateral.address]?.share / 100 || 0)
  }

  apys.holders = rTokenYield * (+(revenueSplit.holders || 0) / 100)
  apys.stakers =
    ((rTokenYield * (supply * rTokenPrice)) / (staked * rsrPrice)) *
    (+(revenueSplit.stakers || 0) / 100)

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

/**
 * #################
 * Wallet Management
 * #################
 */

// Tracks current connected address
export const walletAtom = atom('')

const defaultBalance = {
  value: BigNumber.from(0),
  decimals: 18,
  balance: '0',
}

// Tracks rToken/collaterals/stRSR/RSR balances for a connected account
export const balancesAtom = atom<BalanceMap>({})

// Get balance for current rToken for the selected account
export const rTokenBalanceAtom = atom((get) => {
  const rToken = get(rTokenAtom)

  if (rToken && get(balancesAtom)[rToken.address]) {
    return get(balancesAtom)[rToken.address]
  }

  return defaultBalance
})

export const stRsrBalanceAtom = atom((get) => {
  const stRSR = get(rTokenAtom)?.stToken?.address

  if (stRSR) {
    return get(balancesAtom)[stRSR] || defaultBalance
  }

  return defaultBalance
})

export const rsrBalanceAtom = atom((get) => {
  return get(balancesAtom)[RSR.address] || defaultBalance
})

// Tracks allowance for stRSR/RSR and Collaterals/rToken
export const allowanceAtom = atom<{ [x: string]: BigNumber }>({})

// Store account related rtokens
export const accountRTokensAtom = atom<
  { address: string; name: string; symbol: string }[]
>([])

// Store current rToken holdings for an account
export const accountTokensAtom = atom<AccountToken[]>([])

// Store current stToken holdings (stake) for an account
export const accountPositionsAtom = atom<AccountPosition[]>([])

// Store how much RSR is staked for a given account across the whole protocol
export const accountHoldingsAtom = atom(0)

// List of unstake cooldown for the selected rToken
export const pendingRSRAtom = atom<any[]>([])
export const pendingRSRSummaryAtom = atom((get) => {
  const currentTime = get(blockTimestampAtom)
  return get(pendingRSRAtom).reduce(
    (acc, unstake) => {
      acc.index = unstake.index
      acc.availableAt = unstake.availableAt

      if (currentTime >= unstake.availableAt) {
        acc.availableAmount += unstake.amount
        acc.availableIndex = acc.availableAt
      } else {
        acc.pendingAmount += unstake.amount
      }

      return acc
    },
    {
      index: BigNumber.from(0),
      availableIndex: BigNumber.from(0),
      pendingAmount: 0,
      availableAt: 0,
      availableAmount: 0,
    }
  )
})

/**
 * ############################
 * ? Transactions related atoms
 * ############################
 */

// Store multicalls, fetched on every block
export const callsAtom = atom<RawCall[]>([])
export const multicallStateAtom = atom<MulticallState>({})

// Transactions storage layer
const txStorage = createJSONStorage<TransactionMap>(() => localStorage)
txStorage.getItem = (key: string): TransactionMap => {
  const data = localStorage?.getItem(key)

  if (!data) return {}

  try {
    const parsed = JSON.parse(data) as TransactionMap

    return Object.keys(parsed).reduce((txMap, chainId) => {
      txMap[chainId] = Object.keys(parsed[chainId]).reduce((txs, wallet) => {
        txs[wallet] = parsed[chainId][wallet].map((tx) => {
          if (
            tx.status === TRANSACTION_STATUS.SIGNING ||
            tx.status === TRANSACTION_STATUS.PENDING
          ) {
            return { ...tx, status: TRANSACTION_STATUS.UNKNOWN }
          }

          return tx
        })

        return txs
      }, {} as WalletTransaction)

      return txMap
    }, {} as TransactionMap)
  } catch (e) {
    console.error('Error parsing transaction', e)
    localStorage.setItem(key, JSON.stringify({}))
    return {}
  }
}

// List of recent user transactions
export const txAtom = atomWithStorage<TransactionMap>(
  'transactions',
  {},
  txStorage
)
export const currentTxAtom = atom((get) => {
  const chain = get(chainIdAtom) ?? CHAIN_ID
  const account = get(walletAtom) ?? ''
  const txs = get(txAtom)

  return txs[chain] && txs[chain][account] ? txs[chain][account] : []
})

// Return list of transactions ordered by status
export const pendingTxAtom = atom((get) => {
  const result = {
    pending: <[number, TransactionState][]>[],
    signing: <[number, TransactionState][]>[],
    mining: <[number, TransactionState][]>[],
  }

  return get(currentTxAtom).reduce((acc, current, index) => {
    if (current.status === TRANSACTION_STATUS.PENDING) {
      acc.pending = [...acc.pending, [index, current]]
    }

    if (current.status === TRANSACTION_STATUS.MINING) {
      acc.mining = [...acc.mining, [index, current]]
    }

    if (current.status === TRANSACTION_STATUS.SIGNING) {
      acc.signing = [...acc.signing, [index, current]]
    }

    return acc
  }, result)
})

// Add transaction to queue
export const addTransactionAtom = atom(
  null,
  (get, set, tx: TransactionState[]) => {
    const txs = get(txAtom)
    const chainId = get(chainIdAtom)
    const account = get(walletAtom)

    if (!chainId || !account) {
      return
    }

    const currentTx =
      txs[chainId] && txs[chainId][account] ? txs[chainId][account] : []

    set(txAtom, {
      ...txs,
      [chainId]: {
        ...(txs[chainId] ?? {}),
        [account]: [...currentTx, ...tx].slice(-50),
      },
    })
  }
)

// Update tx status
export const updateTransactionAtom = atom(
  null,
  (get, set, data: [number, Partial<TransactionState>]) => {
    const txs = get(txAtom)
    const chainId = get(chainIdAtom)
    const account = get(walletAtom)
    const [index, newData] = data

    if (!chainId || !account) {
      return
    }

    const currentTx =
      txs[chainId] && txs[chainId][account] ? txs[chainId][account] : []

    set(txAtom, {
      ...txs,
      [chainId]: {
        [account]: [
          ...currentTx.slice(0, index),
          { ...currentTx[index], ...newData },
          ...currentTx.slice(index + 1),
        ],
      },
    })
  }
)

// RSV Metrics
export interface RPayTx {
  id: string
  type: string
  amountUSD: string
  timestamp: number
}

export const rpayTransactionsAtom = atom<RPayTx[]>([])

export const rpayOverviewAtom = atom({
  volume: 0,
  txCount: 0,
  holders: 0,
  dayVolume: 0,
  dayTxCount: 0,
})

export const RSVOverview = {
  dayVolume: 0,
  dayTxCount: 0,
  volume: 5784335728,
  txCount: 12640025,
  holders: 0,
}
