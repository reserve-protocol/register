import { expect } from '@playwright/test'
import base from '../fixtures/base'
import _input from '../components/input'
import _error from '../components/error'

const test = base()

test.describe.configure({ mode: 'serial' })

test('Common tests', async ({ page, web3 }) => {
  await page.goto('/')

  await test.step(`Wallet connected`, async () => {
    const locator = page.getByTestId('account-display-name')
    await expect(locator).toBeVisible()
  })
})

test('Numerical Input', async ({ page, web3 }) => {
  const ethPlusAddress = '0xe72b141df173b999ae7c1adcbf60cc9833ce56a8'
  await page.goto(`/ethereum/token/${ethPlusAddress}/issuance`)

  const input = _input(page)
  await input.waitForReady()
  await input.input('1.234')

  const error = _error(page, 'mint')
  await error.waitForReady()
  await error.expectedMessage('Insufficient funds')

  await input.clearInput()
  await error.notPresent()
})
