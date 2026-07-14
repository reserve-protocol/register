import { test as walletTest, expect } from '../fixtures/wallet'
import { DtfHarness } from './controller'

// The first-class test harness. One `harness` per test, composed over the base
// mock/wallet fixtures:
//
//   test('overview renders', async ({ harness }) => {
//     await harness.chain.freezeAt(rebalanceTime(dtf))
//     await harness.goto(dtf, 'overview')
//     await harness.wallet.connect()
//     harness.tx.confirm()
//     const hold = harness.mock.hold({ boundary: 'subgraph', operationName: 'GetIndexDTF' })
//     ...assert skeleton...
//     hold.release()
//     ...assert content...
//     expect(harness.requests.naming(dtf.address).every(r => ...)).toBe(true)
//   })
//
// `page`, `overrides`, `txLog`, `boundaryRequests` stay available for escape
// hatches; the harness is the intended entry for new specs.
export const test = walletTest.extend<{ harness: DtfHarness }>({
  harness: async ({ page, overrides, txLog, boundaryRequests, walletChain }, use) => {
    await use(new DtfHarness(page, { overrides, txLog, boundaryRequests, walletChain }))
  },
})

export { expect }
export { DtfHarness } from './controller'
