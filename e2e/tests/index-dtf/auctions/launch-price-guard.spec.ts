import { encodeAbiParameters, encodeFunctionData, parseAbi } from 'viem'
import { expect, test } from '../../../harness'
import { REGISTRY, TEST_ADDRESS } from '../../../helpers/registry'
import { rebalanceTime } from '../../../helpers/clock'
import { loadSnapshot } from '../../../helpers/snapshots'
import {
  encodeActiveRebalance,
  loadRebalances,
  proposalIdFor,
} from '../../../helpers/rebalance-tuple'

// Z26 — the openAuction price guard, end-to-end. When a basket token's price is
// unavailable (a hard {statusCode} error body OR a 0 price in a well-formed
// array), the launcher must VISIBLY block with a "price unavailable — cannot
// launch" reason and NEVER fire openAuction with a coerced/skewed weight.
//
// Same launcher setup as launch-write.spec.ts (cmc20 = bsc, non-hybrid, v5): the
// test wallet is enrolled in auctionLaunchers so LaunchAuctionsButton renders.
// ENGINEER REVIEW REQUIRED: this asserts the calldata is NOT sent when a price
// is missing — the whole point of the guard on the openAuction calldata path.
const dtf = REGISTRY.find((d) => d.slug === 'cmc20')! // bsc, non-hybrid, v5

test.use({ walletChain: 56 })

const BSC_USDT = '0x55d398326f99059fF775485246999027B3197955'
// A cmc20 rebalance/basket token (CAKE on BSC) — present in the price batch, so
// zeroing its price exercises the "well-formed array, one unusable price" path.
const CMC20_TOKEN = '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c'

function seedAuctionDetail(overrides: {
  api: (m: { method?: string; pathname: string }, data: unknown) => unknown
  ethCall: (a: string, c: string, r: `0x${string}`) => unknown
}) {
  overrides.api({ pathname: '/zapper/tokens' }, [])
  overrides.api({ method: 'POST', pathname: '/rebalance/liquidity' }, {
    market: null,
    totals: { sellUsd: 0, buyUsd: 0 },
    assets: [],
  })
  overrides.ethCall(
    BSC_USDT,
    encodeFunctionData({
      abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
      functionName: 'balanceOf',
      args: [TEST_ADDRESS],
    }),
    encodeAbiParameters([{ type: 'uint256' }], [0n])
  )
}

// applyPriceFailure runs BEFORE navigation so the very first price fetch already
// hits the failing mock (applying it post-goto would let the initial fetch
// resolve with real prices and mask the guard).
async function mountLauncher(
  harness: any,
  overrides: any,
  applyPriceFailure: () => void
) {
  const page = harness.page
  const latest = loadRebalances(dtf)[0]
  const { dtf: dtfObj } = loadSnapshot<{
    dtf: { auctionLaunchers: string[] }
  }>(`${dtf.snapshotDir}/dtf.json`)

  await harness.chain.freezeAt(rebalanceTime(latest, 'restricted'))

  overrides.subgraph(
    { operationName: 'GetIndexDTF' },
    {
      dtf: {
        ...dtfObj,
        auctionLaunchers: [
          ...dtfObj.auctionLaunchers,
          TEST_ADDRESS.toLowerCase(),
        ],
      },
    }
  )
  seedAuctionDetail(overrides)
  overrides.ethCall(dtf.address, '0xaa3b5568', encodeActiveRebalance(dtf, latest))
  applyPriceFailure()

  await harness.goto(dtf, `auctions/rebalance/${proposalIdFor(dtf, latest)}`)
  await harness.wallet.connect()
  await expect(page.getByTestId('dtf-auctions')).toBeVisible({ timeout: 20_000 })
  return page
}

// The reason + disabled state appear only once the price query settles (a
// {statusCode} body errors after React Query exhausts its retries under the
// frozen clock; the 0-price case settles immediately). Pump the clock until the
// guard renders, then prove the launch never fired.
async function expectBlockedWithReason(harness: any, page: any) {
  const reason = page.getByTestId('auctions-price-unavailable')
  await expect(async () => {
    await harness.chain.advance(5_000)
    await expect(reason).toBeVisible()
  }).toPass({ timeout: 30_000 })

  await expect(page.getByTestId('auctions-launch-btn')).toBeDisabled()
  // Give any (buggy) launch a chance to fire, then prove nothing was sent.
  await harness.chain.advance(5_000)
  expect(harness.tx.log.length).toBe(0)
}

test('auctions: a {statusCode} price error blocks launch with a visible reason @smoke', async ({
  harness,
  overrides,
}) => {
  // Real error-body shape from the price API — parseCurrentPricesResponse throws
  // rather than coercing every token to $0.
  const page = await mountLauncher(harness, overrides, () =>
    overrides.api(
      { method: 'GET', pathname: '/current/prices' },
      { statusCode: 500, message: 'price service unavailable' }
    )
  )

  await expectBlockedWithReason(harness, page)
})

test('auctions: a single 0 price in the batch blocks launch with a visible reason @smoke', async ({
  harness,
  overrides,
}) => {
  // Well-formed array, one token priced 0 → indeterminate weight math.
  const page = await mountLauncher(harness, overrides, () =>
    overrides.priceGap(56, CMC20_TOKEN, 'zero')
  )

  await expectBlockedWithReason(harness, page)
})
