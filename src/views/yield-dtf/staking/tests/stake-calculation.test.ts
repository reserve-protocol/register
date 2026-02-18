import { describe, it, expect } from 'vitest'

/**
 * This file tests the stake/unstake LIFO matching logic used in accountStakeHistoryAtom.
 *
 * The logic is extracted here for testing. The actual atom at atoms.ts uses this same algorithm
 * but wrapped in async GraphQL fetching.
 *
 * BUG VERIFICATION: The isStake field from subgraph is a string ("true"/"false"), not boolean.
 * The current implementation uses `if (record.isStake)` which treats "false" as truthy.
 */

type StakeRecord = {
  exchangeRate: string
  amount: string
  rsrAmount: bigint
  isStake: string // This is a string from the subgraph, not boolean!
}

// This is the exact logic from accountStakeHistoryAtom, extracted for testing
function calculateStakeHistory(records: StakeRecord[]) {
  let stakes: [number, number, number][] = []
  let totalRewardBalance = 0

  for (const record of records) {
    const recordAmount = Number(record.amount)
    const recordExchangeRate = Number(record.exchangeRate)

    // CURRENT IMPLEMENTATION - potentially buggy
    // This treats "false" string as truthy
    if (record.isStake) {
      stakes.push([recordAmount, recordExchangeRate, Number(record.rsrAmount)])
    } else {
      let stakesRewarded = 0
      let unstake = recordAmount

      for (let i = 0; i < stakes.length; i++) {
        const [stakeAmount, stakeExchangeRate, stakeRsrAmount] = stakes[i]
        const snapshotRsrAmount =
          Math.min(unstake, stakeAmount) * stakeExchangeRate
        const currentRsrAmount =
          Math.min(unstake, stakeAmount) * recordExchangeRate

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
          unstake = unstake - stakeAmount
          stakesRewarded++
        }
      }
      stakes = stakes.slice(stakesRewarded)
    }
  }

  return { stakes, totalRewardBalance }
}

// FIXED version for comparison
function calculateStakeHistoryFixed(records: StakeRecord[]) {
  let stakes: [number, number, number][] = []
  let totalRewardBalance = 0

  for (const record of records) {
    const recordAmount = Number(record.amount)
    const recordExchangeRate = Number(record.exchangeRate)

    // FIXED: Compare string value explicitly
    if (record.isStake === 'true' || (record.isStake as any) === true) {
      stakes.push([recordAmount, recordExchangeRate, Number(record.rsrAmount)])
    } else {
      let stakesRewarded = 0
      let unstake = recordAmount

      for (let i = 0; i < stakes.length; i++) {
        const [stakeAmount, stakeExchangeRate, stakeRsrAmount] = stakes[i]
        const snapshotRsrAmount =
          Math.min(unstake, stakeAmount) * stakeExchangeRate
        const currentRsrAmount =
          Math.min(unstake, stakeAmount) * recordExchangeRate

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
          unstake = unstake - stakeAmount
          stakesRewarded++
        }
      }
      stakes = stakes.slice(stakesRewarded)
    }
  }

  return { stakes, totalRewardBalance }
}

describe('Stake LIFO Calculation Logic', () => {
  describe('basic stake/unstake flow', () => {
    it('handles single stake without unstake', () => {
      const records: StakeRecord[] = [
        {
          exchangeRate: '1.0',
          amount: '100',
          rsrAmount: 100n,
          isStake: 'true',
        },
      ]

      const result = calculateStakeHistoryFixed(records)

      expect(result.stakes.length).toBe(1)
      expect(result.stakes[0][0]).toBe(100) // amount
      expect(result.totalRewardBalance).toBe(0)
    })

    it('calculates rewards on full unstake', () => {
      const records: StakeRecord[] = [
        {
          exchangeRate: '1.0',
          amount: '100',
          rsrAmount: 100n,
          isStake: 'true',
        },
        {
          // Exchange rate increased - user earned rewards
          exchangeRate: '1.1',
          amount: '100',
          rsrAmount: 100n,
          isStake: 'false',
        },
      ]

      const result = calculateStakeHistoryFixed(records)

      expect(result.stakes.length).toBe(0) // All unstaked
      // Rewards: 100 * 1.1 - 100 * 1.0 = 10
      expect(result.totalRewardBalance).toBeCloseTo(10, 5)
    })

    it('handles partial unstake (LIFO matching)', () => {
      const records: StakeRecord[] = [
        {
          exchangeRate: '1.0',
          amount: '100',
          rsrAmount: 100n,
          isStake: 'true',
        },
        {
          exchangeRate: '1.1',
          amount: '50', // Partial unstake
          rsrAmount: 50n,
          isStake: 'false',
        },
      ]

      const result = calculateStakeHistoryFixed(records)

      expect(result.stakes.length).toBe(1)
      expect(result.stakes[0][0]).toBe(50) // 100 - 50 remaining
      // Rewards on 50 tokens: 50 * 1.1 - 50 * 1.0 = 5
      expect(result.totalRewardBalance).toBeCloseTo(5, 5)
    })

    it('handles multiple stakes with full unstake spanning entries', () => {
      const records: StakeRecord[] = [
        {
          exchangeRate: '1.0',
          amount: '50',
          rsrAmount: 50n,
          isStake: 'true',
        },
        {
          exchangeRate: '1.0',
          amount: '50',
          rsrAmount: 50n,
          isStake: 'true',
        },
        {
          // Unstake 75 - spans first stake (50) + part of second (25)
          exchangeRate: '1.2',
          amount: '75',
          rsrAmount: 75n,
          isStake: 'false',
        },
      ]

      const result = calculateStakeHistoryFixed(records)

      expect(result.stakes.length).toBe(1)
      expect(result.stakes[0][0]).toBe(25) // 100 - 75 remaining
      // Rewards: 75 * 1.2 - 75 * 1.0 = 15
      expect(result.totalRewardBalance).toBeCloseTo(15, 5)
    })
  })

  describe('BUG: isStake string type handling', () => {
    it('BUG TEST: treats isStake="false" correctly as unstake', () => {
      // This test verifies the bug where "false" string is truthy
      const records: StakeRecord[] = [
        {
          exchangeRate: '1.0',
          amount: '100',
          rsrAmount: 100n,
          isStake: 'true',
        },
        {
          exchangeRate: '1.1',
          amount: '100',
          rsrAmount: 100n,
          isStake: 'false', // String "false", not boolean false
        },
      ]

      // Current buggy implementation
      const buggyResult = calculateStakeHistory(records)

      // Fixed implementation
      const fixedResult = calculateStakeHistoryFixed(records)

      // BUG: The buggy version treats "false" as truthy, so it ADDS another stake
      // instead of processing an unstake
      expect(buggyResult.stakes.length).toBe(2) // Bug: added as stake
      expect(fixedResult.stakes.length).toBe(0) // Fixed: processed as unstake

      // Bug: No rewards calculated because unstake wasn't processed
      expect(buggyResult.totalRewardBalance).toBe(0)
      expect(fixedResult.totalRewardBalance).toBeCloseTo(10, 5) // Correct rewards
    })

    it('handles boolean true correctly', () => {
      const records: StakeRecord[] = [
        {
          exchangeRate: '1.0',
          amount: '100',
          rsrAmount: 100n,
          isStake: true as any, // Some implementations might send boolean
        },
      ]

      const result = calculateStakeHistoryFixed(records)
      expect(result.stakes.length).toBe(1)
    })

    it('handles boolean false correctly', () => {
      const records: StakeRecord[] = [
        {
          exchangeRate: '1.0',
          amount: '100',
          rsrAmount: 100n,
          isStake: 'true',
        },
        {
          exchangeRate: '1.1',
          amount: '100',
          rsrAmount: 100n,
          isStake: false as any, // Some implementations might send boolean
        },
      ]

      const result = calculateStakeHistoryFixed(records)
      expect(result.stakes.length).toBe(0)
      expect(result.totalRewardBalance).toBeCloseTo(10, 5)
    })
  })

  describe('edge cases', () => {
    it('handles empty records array', () => {
      const result = calculateStakeHistoryFixed([])

      expect(result.stakes.length).toBe(0)
      expect(result.totalRewardBalance).toBe(0)
    })

    it('handles exact stake-unstake match', () => {
      const records: StakeRecord[] = [
        {
          exchangeRate: '1.0',
          amount: '100',
          rsrAmount: 100n,
          isStake: 'true',
        },
        {
          exchangeRate: '1.0', // Same rate - no rewards
          amount: '100',
          rsrAmount: 100n,
          isStake: 'false',
        },
      ]

      const result = calculateStakeHistoryFixed(records)

      expect(result.stakes.length).toBe(0)
      expect(result.totalRewardBalance).toBe(0) // No change in exchange rate
    })

    it('handles negative rewards (exchange rate dropped)', () => {
      const records: StakeRecord[] = [
        {
          exchangeRate: '1.0',
          amount: '100',
          rsrAmount: 100n,
          isStake: 'true',
        },
        {
          exchangeRate: '0.9', // Rate dropped - loss
          amount: '100',
          rsrAmount: 100n,
          isStake: 'false',
        },
      ]

      const result = calculateStakeHistoryFixed(records)

      expect(result.stakes.length).toBe(0)
      // Loss: 100 * 0.9 - 100 * 1.0 = -10
      expect(result.totalRewardBalance).toBeCloseTo(-10, 5)
    })

    it('handles large amounts without precision loss', () => {
      const records: StakeRecord[] = [
        {
          exchangeRate: '1.0',
          amount: '1000000000', // 1 billion
          rsrAmount: 1000000000n,
          isStake: 'true',
        },
        {
          exchangeRate: '1.000001', // Small increase
          amount: '1000000000',
          rsrAmount: 1000000000n,
          isStake: 'false',
        },
      ]

      const result = calculateStakeHistoryFixed(records)

      expect(result.stakes.length).toBe(0)
      // Rewards: 1B * 1.000001 - 1B * 1.0 = 1000
      expect(result.totalRewardBalance).toBeCloseTo(1000, 0)
    })
  })
})
