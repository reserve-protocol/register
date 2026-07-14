/**
 * WRITE SPEC TEMPLATE — copy into e2e/tests/<domain>/<route>/<name>-write.spec.ts
 *
 * A write test proves the app fires the RIGHT transaction and NOTHING else. The
 * minimum oracle below is NON-NEGOTIABLE — a `txLog.length > 0` + `last()` check
 * is NOT acceptable (it hides extra/duplicate/wrong writes). Delete the guidance
 * comments once your test is real.
 *
 * MINIMUM ORACLE (assert all that apply):
 *  1. GUARD: disconnected / unauthorized / wrong-chain → control disabled AND
 *     txLog stays EMPTY (zero writes where forbidden).
 *  2. EXACT-ONE tx: assert txLog has exactly the expected count (not > 0).
 *  3. DECODE: to (contract), chainId, value, function name, and EVERY argument.
 *  4. STATE: pending/disabled while in flight → confirmed after receipt.
 *  5. FAILURE: wallet rejection (tx.decline) and reverted receipt (tx.revert) —
 *     state must NOT advance, control recovers, no phantom success.
 *  6. If an approval precedes the write: assert the exact approve→write ORDER.
 *
 * RULES: no English-copy locators (Lingui-translated) — use data-testid. No
 * waitForTimeout / raw page.clock — wait on an observable (txLog, testid,
 * boundaryRequests) then pump with harness.chain.advance. Money is bigint.
 */
import { decodeFunctionData, parseAbi } from 'viem'
import { test, expect } from '../../../harness'
import { REGISTRY, TEST_ADDRESS } from '../../../helpers/registry'

// Pick the fixture by chain from the registry — never hardcode an address.
// base/lcap + bsc/cmc20 are v5; mainnet/open + base/deprecated are v4.
const dtf = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)!

// Decode against the exact ABI you expect — a wrong function fails to decode.
const ABI = parseAbi(['function doThing(uint256 amount, address to)'])

// For a bsc/mainnet write, put the wallet on the DTF's chain (else "Switch network").
// test.use({ walletChain: dtf.chainId })

test('DOMAIN: <actor> submits doThing() to <contract> @smoke', async ({
  harness,
  overrides,
}) => {
  const page = harness.page

  // 1. Seed the exact on-chain/subgraph/API state the flow reads (per-test).
  //    e.g. overrides.ethCall(addr, calldata, returnHex), harness.seedBalance(...).

  // 2. Navigate + connect. (Use test.use({ wallet: false }) to prove the GUARD.)
  await harness.goto(dtf, 'issuance')
  await harness.wallet.connect()

  // 3. Drive the UI to the ready state; pump the frozen clock so queries flush.
  const submit = page.getByTestId('DOMAIN-submit-btn')
  await expect(async () => {
    await harness.chain.advance(4_000)
    await expect(submit).toBeEnabled()
  }).toPass({ timeout: 20_000 })

  // 4. Queue the outcome, act, pump.
  harness.tx.confirm() // or harness.tx.decline() / harness.tx.revert() for failure cases
  await submit.click()
  await harness.chain.advance(10_000)

  // 5. EXACT-ONE tx + full decode.
  await expect.poll(() => harness.tx.log.length, { timeout: 15_000 }).toBe(1)
  const sent = harness.tx.last()!
  expect(sent.to.toLowerCase()).toBe(dtf.address.toLowerCase())
  expect(sent.chainId).toBe(dtf.chainId)
  const decoded = decodeFunctionData({ abi: ABI, data: sent.data as `0x${string}` })
  expect(decoded.functionName).toBe('doThing')
  expect(decoded.args[1]).toBe(TEST_ADDRESS) // assert EVERY argument, not just the fn
})
