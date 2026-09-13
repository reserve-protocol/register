import {
  encodeAbiParameters,
  getAddress,
  encodeFunctionData,
  parseAbi,
  parseUnits,
  decodeFunctionData,
  decodeFunctionResult,
  multicall3Abi,
  type Hex,
} from 'viem'
import { test, expect, connectWallet } from '../fixtures/wallet'
import { TEST_ADDRESS } from '../helpers/registry'
import { ownedSource, sourceSharedVault } from './owned-source-data'
import { readReviewSource, assertUnchangedSource } from './review-source'

test.use({ actionTimeout: 10_000, navigationTimeout: 30_000 })

for (const { width, result } of [
  { width: 390, result: 'ready' },
  { width: 1400, result: 'ready' },
  { width: 1400, result: 'zero' },
  { width: 1400, result: 'error' },
]) {
  test(`owned Portfolio source ${width} ${result}`, async ({
    page,
    overrides,
    txLog,
  }, info) => {
    const before = readReviewSource(process.cwd())
    overrides.api({ pathname: `/v1/portfolio/${TEST_ADDRESS}` }, ownedSource)
    const vault = sourceSharedVault.token.address
    overrides.ethCall(
      vault,
      encodeFunctionData({
        abi: parseAbi(['function asset() view returns (address)']),
        functionName: 'asset',
      }),
      encodeAbiParameters(
        [{ type: 'address' }],
        [getAddress(sourceSharedVault.underlying.token.address)]
      )
    )
    const abi = parseAbi([
      'function balanceOf(address) view returns (uint256)',
      'function maxWithdraw(address) view returns (uint256)',
      'function convertToAssets(uint256) view returns (uint256)',
      'function previewRedeem(uint256) view returns (uint256)',
    ])
    for (const functionName of ['balanceOf', 'maxWithdraw'] as const) {
      overrides.ethCall(
        vault,
        encodeFunctionData({ abi, functionName, args: [TEST_ADDRESS] }),
        encodeAbiParameters(
          [{ type: 'uint256' }],
          [
            parseUnits(
              functionName === 'balanceOf'
                ? '1000'
                : result === 'zero'
                  ? '0'
                  : '1018.8',
              18
            ),
          ]
        )
      )
    }
    for (const functionName of ['convertToAssets', 'previewRedeem'] as const) {
      overrides.ethCall(
        vault,
        encodeFunctionData({ abi, functionName, args: [parseUnits('1', 18)] }),
        encodeAbiParameters([{ type: 'uint256' }], [parseUnits('1.0188', 18)])
      )
    }
    overrides.price(56, sourceSharedVault.underlying.token.address, 0.002)
    const maxCall = encodeFunctionData({
      abi,
      functionName: 'maxWithdraw',
      args: [TEST_ADDRESS],
    })
    if (result === 'error') overrides.ethCall(vault, maxCall, '0x')
    const hold = overrides.holds.add({
      boundary: 'rpc',
      to: vault,
      selector: encodeFunctionData({
        abi,
        functionName: 'maxWithdraw',
        args: [TEST_ADDRESS],
      }).slice(0, 10),
    })
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/portfolio')
    await connectWallet(page)
    const row = page
      .locator('tbody tr')
      .filter({ hasText: 'Vote-Locked Reserve Rights' })
    await expect(row).toHaveCount(1)
    await expect.poll(() => hold.hits).toBeGreaterThan(0)
    await expect(row).toContainText('1,000')
    await row.scrollIntoViewIfNeeded()
    await info.attach('api-fallback', {
      body: await page.screenshot(),
      contentType: 'image/png',
    })
    const failedResponse =
      result === 'error'
        ? page.waitForResponse((response) => {
            const data = response.request().postData()?.toLowerCase() ?? ''
            return (
              data.includes(vault.slice(2).toLowerCase()) &&
              data.includes(maxCall.slice(2).toLowerCase())
            )
          })
        : null
    hold.release()
    if (result === 'error') {
      const response = await failedResponse!
      const request = response.request().postDataJSON()
      const requests = Array.isArray(request) ? request : [request]
      const body = await response.json()
      const responses = Array.isArray(body) ? body : [body]
      let matched = false
      for (const call of requests) {
        if (call.method !== 'eth_call') continue
        const { to, data } = call.params[0] as { to: string; data: Hex }
        const answer = responses.find((entry) => entry.id === call.id)
        if (to.toLowerCase() === vault.toLowerCase() && data === maxCall) {
          expect(answer.result).toBe('0x')
          matched = true
        } else if (data.startsWith('0x82ad56cb')) {
          const decoded = decodeFunctionData({ abi: multicall3Abi, data })
          if (decoded.functionName !== 'aggregate3') continue
          const index = decoded.args[0].findIndex(
            (inner) =>
              inner.target.toLowerCase() === vault.toLowerCase() &&
              inner.callData === maxCall
          )
          if (index < 0) continue
          const values = decodeFunctionResult({
            abi: multicall3Abi,
            functionName: 'aggregate3',
            data: answer.result,
          })
          expect(values[index].returnData).toBe('0x')
          matched = true
        }
      }
      expect(matched).toBe(true)
      await expect(row).toContainText('1,000')
      await expect(row).not.toContainText('1.0188')
      await expect(row).toContainText('$42.66')
    } else {
      await expect(row).toContainText('1.0188')
      await expect(row).toContainText(result === 'zero' ? '0 RSR' : '1,018.8')
      await expect(row).toContainText(result === 'zero' ? '$0.00' : '$2.04')
    }
    await info.attach(
      result === 'error' ? 'decode-failure-fallback' : 'live-underlying',
      {
        body: await page.screenshot(),
        contentType: 'image/png',
      }
    )
    await expect(
      page.locator('tbody tr').filter({ hasText: 'eusdRSR' })
    ).toContainText('62,500')
    const inactive = page.locator('tbody tr').filter({ hasText: 'hyusdRSR' })
    await expect(inactive).toHaveCount(1)
    await expect(
      inactive.getByRole('button', { name: 'Withdraw', exact: true })
    ).toBeDisabled()
    expect(txLog).toHaveLength(0)
    assertUnchangedSource(before, readReviewSource(process.cwd()))
  })
}
