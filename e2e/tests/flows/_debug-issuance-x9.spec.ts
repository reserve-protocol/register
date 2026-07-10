import { expect, test } from '../../fixtures/wallet'
import { freezeTime } from '../../helpers/clock'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8'

test('debug bare swap page', async ({ page, unmockedCalls }) => {
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  await freezeTime(page, Math.floor(Date.now() / 1000))
  await page.goto(dtfPath(dtf, 'issuance'))
  for (let i = 0; i < 4; i++) await page.clock.runFor(5000)
  console.log('=== dtf-issuance:', await page.getByTestId('dtf-issuance').count())
  console.log('=== mode-switch:', await page.getByTestId('issuance-mode-switch').count())
  console.log('=== UNMOCKED UNIQUE:\n' + [...new Set(unmockedCalls)].join('\n'))
  expect(true).toBe(true)
})

test('debug bare manual page', async ({ page, unmockedCalls }) => {
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  await freezeTime(page, Math.floor(Date.now() / 1000))
  await page.goto(dtfPath(dtf, 'issuance/manual'))
  for (let i = 0; i < 4; i++) await page.clock.runFor(5000)
  console.log('=== M mode-buy:', await page.getByTestId('issuance-mode-buy').count())
  console.log('=== M max-amount:', await page.getByTestId('issuance-max-amount').count())
  console.log('=== M UNMOCKED UNIQUE:\n' + [...new Set(unmockedCalls)].join('\n'))
  expect(true).toBe(true)
})
