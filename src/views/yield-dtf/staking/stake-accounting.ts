export interface AccountStakeRecord {
  exchangeRate: string
  amount: string
  rsrAmount: string
  isStake: string | boolean
}

// Open stake, in stRSR, together with the RSR that was paid for it
export interface StakeLot {
  amount: number
  rsrAmount: number
}

const isStakeRecord = (record: AccountStakeRecord) =>
  record.isStake === true || record.isStake === 'true'

/**
 * stRSR is fungible, so an unstake burns a proportional slice of every open
 * stake rather than a specific one: unstaking x% of the position removes x%
 * of both its stRSR and its RSR cost basis, leaving the remaining rewards at
 * (100 - x)% of what they were.
 */
export const calculateStakeLots = (
  records: AccountStakeRecord[]
): StakeLot[] => {
  let lots: StakeLot[] = []

  for (const record of records) {
    const amount = Number(record.amount)

    if (isStakeRecord(record)) {
      lots.push({ amount, rsrAmount: Number(record.rsrAmount) })
      continue
    }

    const staked = lots.reduce((total, lot) => total + lot.amount, 0)

    if (!staked) {
      continue
    }

    const remainingShare = Math.max(1 - amount / staked, 0)

    if (!remainingShare) {
      lots = []
      continue
    }

    lots = lots.map(({ amount, rsrAmount }) => ({
      amount: amount * remainingShare,
      rsrAmount: rsrAmount * remainingShare,
    }))
  }

  return lots
}

// RSR accrued by the open position: what it is worth now minus what it cost
export const calculateStakeRewards = (lots: StakeLot[], exchangeRate: number) =>
  lots.reduce(
    (rewards, { amount, rsrAmount }) =>
      rewards + amount * exchangeRate - rsrAmount,
    0
  )
