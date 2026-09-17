import { getStartRebalance } from '@reserve-protocol/dtf-rebalance-lib'
import type { StartRebalanceArgsPartial as StartRebalanceArgsPartialV5 } from '@reserve-protocol/dtf-rebalance-lib/dist/types'
import { decodeFunctionData, encodeFunctionData, type Address } from 'viem'
import { describe, expect, it, vi } from 'vitest'
import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import dtfIndexAbiV5 from '@/abis/dtf-index-abi'
import {
  buildStartRebalanceCalldata,
  type StartRebalanceCalldataInput,
} from '../start-rebalance-calldata'

const sdkCalls = vi.hoisted(() => ({ buildArgs: 0 }))
vi.mock('@reserve-protocol/react-sdk', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@reserve-protocol/react-sdk')>()
  return {
    ...actual,
    buildIndexDtfStartRebalanceArgs: (
      ...params: Parameters<typeof actual.buildIndexDtfStartRebalanceArgs>
    ) => {
      sdkCalls.buildArgs += 1
      return actual.buildIndexDtfStartRebalanceArgs(...params)
    },
  }
})

const USDC = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' as Address
const WETH = '0x2170Ed0880ac9A755fd29B2688956BD959F933F8' as Address
const BTCB = '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c' as Address

// A 1000-share DTF holding stables, moving toward 40/30/30 USDC/WETH/BTCB.
const input = (folioVersion: 4 | 5): StartRebalanceCalldataInput => ({
  folioVersion,
  supply: 1_000n * 10n ** 18n,
  tokens: [USDC, WETH, BTCB],
  decimals: [18n, 18n, 18n],
  balances: [100_000n * 10n ** 18n, 0n, 0n],
  targetBasket: [4n * 10n ** 17n, 3n * 10n ** 17n, 3n * 10n ** 17n],
  prices: [1, 2475.13, 79_322.9],
  priceErrors: [0.25, 0.5, 0.5],
  maxAuctionSizesUsd: [1_000_000, 1_000_000, 1_000_000],
  weightControl: false,
  deferWeights: false,
  auctionLauncherWindow: 259_200n,
  ttl: 604_800n,
})

// Frozen pre-migration Register encoding: the library called directly.
function legacyV5(i: StartRebalanceCalldataInput) {
  const args = getStartRebalance(
    5,
    i.supply,
    i.tokens,
    i.balances,
    i.decimals,
    i.targetBasket,
    i.prices,
    i.priceErrors,
    i.maxAuctionSizesUsd,
    i.weightControl,
    i.deferWeights
  ) as StartRebalanceArgsPartialV5
  return encodeFunctionData({
    abi: dtfIndexAbiV5,
    functionName: 'startRebalance',
    args: [args.tokens as any, args.limits as any, i.auctionLauncherWindow, i.ttl],
  })
}

describe('buildStartRebalanceCalldata', () => {
  it('v5: SDK-built args encode byte-equal to the legacy library path', () => {
    sdkCalls.buildArgs = 0
    const calldata = buildStartRebalanceCalldata(input(5))
    expect(calldata).toBe(legacyV5(input(5)))
    expect(sdkCalls.buildArgs).toBe(1)

    const decoded = decodeFunctionData({ abi: dtfIndexAbiV5, data: calldata })
    expect(decoded.functionName).toBe('startRebalance')
    expect((decoded.args as unknown as unknown[])[2]).toBe(259_200n)
    expect((decoded.args as unknown as unknown[])[3]).toBe(604_800n)
  })

  it('v5: hybrid baskets pass deferWeights through to the SDK', () => {
    const deferred = buildStartRebalanceCalldata({
      ...input(5),
      weightControl: true,
      deferWeights: true,
    })
    const fixed = buildStartRebalanceCalldata({ ...input(5), weightControl: true })
    expect(deferred).not.toBe(fixed)
  })

  it('v4: stays on the Register-local library and never touches the SDK', () => {
    sdkCalls.buildArgs = 0
    const calldata = buildStartRebalanceCalldata(input(4))
    const decoded = decodeFunctionData({ abi: dtfIndexAbiV4, data: calldata })
    expect(decoded.functionName).toBe('startRebalance')
    expect((decoded.args as unknown as unknown[])[0]).toEqual([USDC, WETH, BTCB])
    expect(sdkCalls.buildArgs).toBe(0)
  })
})
