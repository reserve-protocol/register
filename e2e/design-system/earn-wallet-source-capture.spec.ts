import { test, expect, connectWallet } from '../fixtures/wallet'
import {
  encodeAbiParameters,
  encodeFunctionData,
  erc20Abi,
  parseAbi,
  parseUnits,
} from 'viem'
import { TEST_ADDRESS } from '../helpers/registry'
import { sourceLcap } from './earn-source-data'
import { readReviewSource, assertUnchangedSource } from './review-source'

test.use({ actionTimeout: 10_000, navigationTimeout: 20_000 })

for (const width of [390, 1400]) {
  test(`Earn Index wallet ${width}`, async ({
    page,
    overrides,
    txLog,
  }, info) => {
    const source = readReviewSource(process.cwd())
    overrides.api({ pathname: '/dtf/daos' }, [sourceLcap])
    const preview = encodeFunctionData({
      abi: parseAbi(['function previewRedeem(uint256) view returns (uint256)']),
      functionName: 'previewRedeem',
      args: [parseUnits('1', sourceLcap.token.decimals)],
    })
    overrides.ethCall(
      sourceLcap.token.address,
      preview,
      encodeAbiParameters(
        [{ type: 'uint256' }],
        [parseUnits('1.5', sourceLcap.underlying.token.decimals)]
      )
    )
    overrides.ethCall(
      sourceLcap.token.address,
      encodeFunctionData({
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [TEST_ADDRESS],
      }),
      encodeAbiParameters(
        [{ type: 'uint256' }],
        [parseUnits('12345', sourceLcap.token.decimals)]
      )
    )
    const rate = overrides.holds.add({
      boundary: 'rpc',
      to: sourceLcap.token.address,
      selector: preview.slice(0, 10),
    })
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/earn/index-dtf')
    await connectWallet(page)
    const rows = page.getByTestId('earn-index-dtf').locator('tbody tr')
    await expect(rows).toHaveCount(1)
    await expect(rows.locator('td')).toHaveCount(5)
    await expect.poll(() => rate.hits).toBeGreaterThan(0)
    await rows.scrollIntoViewIfNeeded()
    await info.attach('wallet-loading', {
      body: await page.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    })
    rate.release()
    await expect(rows.locator('td').nth(2)).toContainText('18,517.50')
    await info.attach('wallet-known', {
      body: await page.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    })
    expect(txLog).toHaveLength(0)
    assertUnchangedSource(source, readReviewSource(process.cwd()))
    await info.attach('public-source-digest', {
      body: Buffer.from(source.digest),
      contentType: 'text/plain',
    })
  })
}
