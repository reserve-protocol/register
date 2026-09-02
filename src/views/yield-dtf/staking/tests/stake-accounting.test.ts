import { describe, expect, it } from 'vitest'
import {
  AccountStakeRecord,
  calculateStakeLots,
  calculateStakeRewards,
} from '../stake-accounting'

// Mainnet eUSD (0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f) stRSR exchange rate
const EUSD_EXCHANGE_RATE = 1.244143154429324799

const totalStaked = (records: AccountStakeRecord[]) =>
  calculateStakeLots(records).reduce((total, lot) => total + lot.amount, 0)

// Rewards of an account still holding every stRSR its records account for
const rewards = (records: AccountStakeRecord[], exchangeRate: number) =>
  calculateStakeRewards(
    calculateStakeLots(records),
    exchangeRate,
    totalStaked(records)
  )

// accountStakeRecords of 0x34a5e1bcda39f63d8937f324ebd2cfda542ccbc9 on eUSD:
// a single stake followed by an unstake of ~42% of it
const singleStakeThenPartialUnstake: AccountStakeRecord[] = [
  {
    exchangeRate: '1.059352369827342793',
    amount: '35302145.976314919150553913',
    rsrAmount: '37397412',
    isStake: true,
  },
  {
    exchangeRate: '1.151888699462179604',
    amount: '15000000',
    rsrAmount: '17112997.674930621046463892',
    isStake: false,
  },
]

// accountStakeRecords of 0xcfc0805e42589d04a5ab4bcaff49f81d5210e065 on eUSD:
// seven stakes, an unstake of ~48% of the position, then two more stakes
const stakesAroundUnstake: AccountStakeRecord[] = [
  {
    exchangeRate: '1.189888393685152873',
    amount: '10891233.227153233216585439',
    rsrAmount: '12959352.009907724372934168',
    isStake: true,
  },
  {
    exchangeRate: '1.194633486414740868',
    amount: '3415251.6372068416071641',
    rsrAmount: '4079973.970340058223310731',
    isStake: true,
  },
  {
    exchangeRate: '1.201737637618299924',
    amount: '24512731.835489596197586702',
    rsrAmount: '29457872.447552157598656256',
    isStake: true,
  },
  {
    exchangeRate: '1.205646425580189764',
    amount: '35570647.262567941235833602',
    rsrAmount: '42885623.72768879745574547',
    isStake: true,
  },
  {
    exchangeRate: '1.221916268384512936',
    amount: '8752076.504239112215456527',
    rsrAmount: '10694304.662675625636786109',
    isStake: true,
  },
  {
    exchangeRate: '1.2383605237070746',
    amount: '11283474.185022347426831686',
    rsrAmount: '13973009.00099953',
    isStake: true,
  },
  {
    exchangeRate: '1.239956337547501046',
    amount: '41251776.729468318672594981',
    rsrAmount: '51150401.990798764853331774',
    isStake: true,
  },
  {
    exchangeRate: '1.240360158212865953',
    amount: '65677185.129126589509041339',
    rsrAmount: '81463363.737739143568304617',
    isStake: false,
  },
  {
    exchangeRate: '1.241276361599260083',
    amount: '4869006.612171078293273314',
    rsrAmount: '6043782.81215845303309987',
    isStake: true,
  },
  {
    exchangeRate: '1.244143154429324799',
    amount: '16075320.535902307588826974',
    rsrAmount: '20000000',
    isStake: true,
  },
]

// accountStakeRecords of 0xcde4bfa44a874fe9e482caa4e2fe09996498a683 on eUSD:
// the account holds no stRSR on chain, but the subgraph never recorded the
// unstakes that emptied it
const unrecordedUnstakes: AccountStakeRecord[] = [
  {
    exchangeRate: '0.988395296534066387',
    amount: '7951003.174021738097224151',
    rsrAmount: '7858734.139930518545479687',
    isStake: true,
  },
  {
    exchangeRate: '1.115840233388174727',
    amount: '62934.195902751771393208',
    rsrAmount: '70224.507844219810045868',
    isStake: true,
  },
  {
    exchangeRate: '1.171691014375621023',
    amount: '1202090.605488673480292603',
    rsrAmount: '1408478.760916428298611293',
    isStake: false,
  },
  {
    exchangeRate: '1.171787176200367621',
    amount: '546093.757112913310820019',
    rsrAmount: '639905.661587989010458533',
    isStake: true,
  },
  {
    exchangeRate: '1.171787176200367621',
    amount: '81914.063566936996623002',
    rsrAmount: '95985.849238198516286138',
    isStake: false,
  },
]

// accountStakeRecords of 0x58915ae59cb0d6c7664b2d90deb3726b721367c3 on eUSD:
// staked at parity, fully unstaked later
const fullUnstake: AccountStakeRecord[] = [
  {
    exchangeRate: '1',
    amount: '2000000',
    rsrAmount: '2000000',
    isStake: true,
  },
  {
    exchangeRate: '1.025436163475435016',
    amount: '2000000',
    rsrAmount: '2039612.947908902052482434',
    isStake: false,
  },
]

describe('calculateStakeLots', () => {
  it('reproduces the stRSR balance held on chain', () => {
    // stRSR balances of both accounts as reported by the subgraph
    expect(totalStaked(singleStakeThenPartialUnstake)).toBeCloseTo(
      20302145.976314919,
      6
    )
    expect(totalStaked(stakesAroundUnstake)).toBeCloseTo(90944333.40009418, 6)
  })

  it('drops every lot on a full unstake', () => {
    expect(calculateStakeLots(fullUnstake)).toEqual([])
    expect(rewards(fullUnstake, EUSD_EXCHANGE_RATE)).toBe(0)
  })

  it('leaves the stake of an in-progress unstake out of the position', () => {
    // stRSR is burnt when the unstake is queued, so the RSR waiting out the
    // cooldown no longer counts towards the position or its rewards
    const [stake, unstake] = singleStakeThenPartialUnstake

    expect(totalStaked(singleStakeThenPartialUnstake)).toBeCloseTo(
      Number(stake.amount) - Number(unstake.amount),
      6
    )
  })

  it('never leaves a lot behind when the unstake exceeds the tracked history', () => {
    const [stake, unstake] = singleStakeThenPartialUnstake

    expect(
      calculateStakeLots([stake, { ...unstake, amount: '100000000' }])
    ).toEqual([])
  })

  it('reads isStake as either a boolean or a string', () => {
    const asStrings = stakesAroundUnstake.map((record) => ({
      ...record,
      isStake: String(record.isStake),
    }))

    expect(totalStaked(asStrings)).toBe(totalStaked(stakesAroundUnstake))
  })
})

describe('calculateStakeRewards', () => {
  it('keeps rewards proportional to the share of the position still staked', () => {
    const [stake, unstake] = singleStakeThenPartialUnstake
    const stakedShare = 1 - Number(unstake.amount) / Number(stake.amount)

    expect(
      rewards(singleStakeThenPartialUnstake, EUSD_EXCHANGE_RATE)
    ).toBeCloseTo(rewards([stake], EUSD_EXCHANGE_RATE) * stakedShare, 6)
    expect(
      rewards(singleStakeThenPartialUnstake, EUSD_EXCHANGE_RATE)
    ).toBeCloseTo(3751649.484067209, 6)
  })

  it('keeps the rewards of earlier stakes when a later stake is unstaked', () => {
    // Matching the unstake against whole stakes oldest-first used to close the
    // cheapest lots outright and report 781_861 RSR for this account
    expect(rewards(stakesAroundUnstake, EUSD_EXCHANGE_RATE)).toBeCloseTo(
      1871984.7830356685,
      6
    )
  })

  it('has no rewards without stakes', () => {
    expect(rewards([], EUSD_EXCHANGE_RATE)).toBe(0)
  })

  it('has no rewards once the stRSR is gone, even if records say otherwise', () => {
    const lots = calculateStakeLots(unrecordedUnstakes)

    // The records leave stake open and would report ~1.7M RSR of rewards
    expect(lots.length).toBeGreaterThan(0)
    expect(calculateStakeRewards(lots, EUSD_EXCHANGE_RATE, 0)).toBe(0)
  })

  it('scales rewards down to the stRSR actually held', () => {
    const lots = calculateStakeLots(stakesAroundUnstake)
    const held = lots.reduce((total, lot) => total + lot.amount, 0) / 4

    expect(calculateStakeRewards(lots, EUSD_EXCHANGE_RATE, held)).toBeCloseTo(
      1871984.7830356685 / 4,
      6
    )
  })

  it('does not credit rewards to stRSR the records cannot explain', () => {
    // Cancelling an unstake mints stRSR back; until it shows up in the records
    // it has no cost basis to earn rewards against
    const lots = calculateStakeLots(stakesAroundUnstake)
    const held = lots.reduce((total, lot) => total + lot.amount, 0)

    expect(
      calculateStakeRewards(lots, EUSD_EXCHANGE_RATE, held * 3)
    ).toBeCloseTo(calculateStakeRewards(lots, EUSD_EXCHANGE_RATE, held), 6)
  })
})
