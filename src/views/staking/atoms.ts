import { gql } from 'graphql-request'
import { atom } from 'jotai'
import { safeParseEther } from 'utils'
import { atomWithLoadable } from 'utils/atoms/utils'
import {
  blockTimestampAtom,
  chainIdAtom,
  gqlClientAtom,
  rTokenAtom,
  rTokenStateAtom,
  rsrBalanceAtom,
  stRsrBalanceAtom,
  walletAtom,
} from './../../state/atoms'
import StRSR from 'abis/StRSR'
import { readContract } from 'wagmi/actions'
import { Hex, formatEther, toHex } from 'viem'
import { publicClient } from 'state/chain'

const isValid = (value: bigint, max: bigint) => value > 0n && value <= max

export const stakeAmountAtom = atom('')
export const unStakeAmountAtom = atom('')
export const isValidStakeAmountAtom = atom((get) => {
  return isValid(
    safeParseEther(get(stakeAmountAtom) || '0'),
    get(rsrBalanceAtom).value
  )
})

export const isValidUnstakeAmountAtom = atom((get) => {
  return isValid(
    safeParseEther(get(unStakeAmountAtom) || '0'),
    get(stRsrBalanceAtom).value
  )
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
      acc.index = unstake.index
      acc.availableAt = unstake.availableAt

      if (currentTime >= unstake.availableAt) {
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

const accountStakeHistoryAtom = atomWithLoadable(async (get) => {
  const gqlClient = get(gqlClientAtom)
  const wallet = get(walletAtom)
  const rToken = get(rTokenAtom)

  if (!wallet || !rToken) {
    return null
  }

  const request: any = await gqlClient.request(
    gql`
      query getAccountStakeHistory($id: String!) {
        accountStakeRecords(orderBy: blockNumber, where: { account: $id }) {
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

  let stakes: [number, number, number][] = []
  let totalRewardBalance = 0

  for (const record of request.accountStakeRecords as {
    exchangeRate: string
    amount: string
    rsrAmount: bigint
    isStake: string
  }[]) {
    const recordAmount = Number(record.amount)
    const recordExchangeRate = Number(record.exchangeRate)

    if (record.isStake) {
      stakes.push([recordAmount, recordExchangeRate, Number(record.rsrAmount)])
    } else {
      let stakesRewarded = 0
      let unstake = recordAmount

      // Calculate current stake rewards
      for (let i = 0; i < stakes.length; i++) {
        const [stakeAmount, stakeExchangeRate, stakeRsrAmount] = stakes[i]
        // Calculate rewards from this stake and keep going
        const snapshotRsrAmount =
          Math.min(unstake, stakeAmount) * stakeExchangeRate
        const currentRsrAmount =
          Math.min(unstake, stakeAmount) * recordExchangeRate

        // Count rewards
        totalRewardBalance += currentRsrAmount - snapshotRsrAmount

        if (stakeAmount > unstake) {
          stakes[i] = [
            stakeAmount - unstake,
            stakeExchangeRate,
            stakeRsrAmount - snapshotRsrAmount,
          ]
          break
        } else if (stakeAmount === unstake) {
          stakesRewarded++
          break
        } else {
          // Continue counting rewards
          unstake = unstake - stakeAmount
          stakesRewarded++
        }
      }
      // Remove accrued stakes
      stakes = stakes.slice(stakesRewarded)
    }
  }

  return {
    stakes,
    totalRewardBalance,
  }
})

const exchangeRateAtom = atom((get) => get(rTokenStateAtom).exchangeRate)

// TODO: Check re-renders on exchangeRateUpdate improve memo
export const accountCurrentPositionAtom = atom((get) => {
  const stakeHistory = get(accountStakeHistoryAtom)
  const exchangeRate = get(exchangeRateAtom)

  let stBalance = 0
  let rsrBalance = 0

  if (!stakeHistory) {
    return 0
  }

  for (const [stakeAmount, _, stakeRsrAmount] of stakeHistory.stakes) {
    stBalance += stakeAmount
    rsrBalance += stakeRsrAmount
  }

  return stBalance * exchangeRate - rsrBalance
})

// TODO: Delete with release of 3.2.0
export const pendingRSRManualAtom = atomWithLoadable(
  async (
    get
  ): Promise<Array<{ availableAt: bigint; index: bigint; amount: bigint }>> => {
    const rToken = get(rTokenAtom)
    const account = get(walletAtom)
    const chainId = get(chainIdAtom)
    const client = publicClient({ chainId })

    if (!rToken || !account) {
      return []
    }

    // Reads draft era from storage slot 265
    const draftEra: string =
      (await client.getStorageAt({
        address: rToken.stToken?.address!,
        slot: '0x0000000000000000000000000000000000000000000000000000000000000109',
      })) || ''

    const callParams = {
      abi: StRSR,
      address: rToken.stToken?.address!,
    }

    const data = []
    const firstRemainingDraft = await readContract({
      ...callParams,
      functionName: 'firstRemainingDraft',
      args: [BigInt(draftEra), account],
    })

    const draftQueueLength = await readContract({
      ...callParams,
      functionName: 'draftQueueLen',
      args: [BigInt(draftEra), account],
    })

    for (
      let i = 0;
      i < Number(draftQueueLength) - Number(firstRemainingDraft);
      i++
    ) {
      const draft = await readContract({
        ...callParams,
        functionName: 'draftQueues',
        args: [BigInt(draftEra), account, BigInt(i)],
      })

      if (draft) {
        data.push({
          availableAt: draft[1],
          index: BigInt(i),
          amount: draft[0],
        })
      }
    }

    return data
  }
)
