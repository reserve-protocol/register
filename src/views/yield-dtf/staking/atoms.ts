import { gql } from 'graphql-request'
import { atom } from 'jotai'
import { parseDuration } from 'utils'
import { atomWithLoadable } from 'utils/atoms/utils'
import {
  blockTimestampAtom,
  gqlClientAtom,
  rTokenAtom,
  rTokenConfigurationAtom,
  rTokenStateAtom,
  walletAtom,
} from '@/state/atoms'
import {
  AccountStakeRecord,
  calculateStakeLots,
  calculateStakeRewards,
} from './stake-accounting'

export const unstakeDelayAtom = atom((get) => {
  const params = get(rTokenConfigurationAtom)

  return parseDuration(+params?.unstakingDelay || 0, { units: ['d', 'h', 's'] })
})

// List of unstake cooldown for the selected rToken
export const pendingRSRAtom = atom<
  { availableAt: number; index: bigint; amount: number }[]
>([])

export const pendingRSRSummaryAtom = atom<{
  index: bigint
  availableIndex: bigint
  pendingAmount: number
  availableAt: number
  availableAmount: number
}>((get) => {
  const currentTime = get(blockTimestampAtom)

  return get(pendingRSRAtom).reduce(
    (acc, unstake) => {
      acc.availableAt = unstake.availableAt

      if (currentTime >= unstake.availableAt) {
        acc.index = unstake.index
        acc.availableAmount += unstake.amount
        acc.availableIndex = BigInt(acc.availableAt)
      } else {
        acc.pendingAmount += unstake.amount
      }

      return acc
    },
    {
      index: 0n,
      availableIndex: 0n,
      pendingAmount: 0,
      availableAt: 0,
      availableAmount: 0,
    }
  )
})

const accountStakeLotsAtom = atomWithLoadable(async (get) => {
  const gqlClient = get(gqlClientAtom)
  const wallet = get(walletAtom)
  const rToken = get(rTokenAtom)

  if (!wallet || !rToken) {
    return null
  }

  const request: any = await gqlClient.request(
    gql`
      query getAccountStakeHistory($id: String!) {
        accountStakeRecords(
          first: 1000
          orderBy: blockNumber
          orderDirection: asc
          where: { account: $id }
        ) {
          exchangeRate
          amount
          rsrAmount
          isStake
        }
      }
    `,
    { id: `${wallet.toLowerCase()}-${rToken.address.toLowerCase()}` }
  )

  if (!request.accountStakeRecords) {
    return null
  }

  return calculateStakeLots(request.accountStakeRecords as AccountStakeRecord[])
})

const exchangeRateAtom = atom((get) => get(rTokenStateAtom).exchangeRate)

// TODO: Check re-renders on exchangeRateUpdate improve memo
export const accountCurrentPositionAtom = atom((get) => {
  const lots = get(accountStakeLotsAtom)
  const exchangeRate = get(exchangeRateAtom)

  if (!lots) {
    return 0
  }

  return calculateStakeRewards(lots, exchangeRate)
})

export const rateAtom = atom((get) => {
  const { exchangeRate } = get(rTokenStateAtom)

  return exchangeRate
})

export const stRsrTickerAtom = atom((get) => {
  const rToken = get(rTokenAtom)

  return rToken?.stToken?.symbol ?? 'stRSR'
})

export enum StakeMetricType {
  Exchange,
  Staked,
}
