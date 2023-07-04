import { test } from '@guardianui/test'
import { setBalanceAtSlot } from './utils'

test('Wrap Token to saToken', async ({ page, gui }) => {
  // Fork Mainnet
  await gui.initializeChain(1, 17586536)

  // Go to eUSDC mint page
  await page.goto(
    'http://localhost:3000/#/issuance?token=0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F'
  )

  // Block unnecessary http requests to speed up the tests
  await page.route('**/*.{png,jpg,jpeg,webp}', (route) => route.abort())
  await page.route(/(analytics|font|thegraph)/, (route) => route.abort())

  // Mock balances
  await gui.setEthBalance('100000000000000000000000')

  await setBalanceAtSlot({
    token: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    slotNumber: '2',
    value: '1000000000000000000000000',
    gui,
  })
  await setBalanceAtSlot({
    token: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
    slotNumber: '9',
    value: '1000000000000',
    gui,
  })
  await setBalanceAtSlot({
    token: '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
    slotNumber: '2',
    value: '1000000000000',
    gui,
  })

  // Wrap DAI to saDAI
  await page
    .getByRole('button', { name: 'Wrap AAVE tokens', exact: true })
    .click()
  await page.getByText('Max: 1,000,000').nth(0).click({ timeout: 90_000 })
  await page.getByText('Estimated gas cost:$').waitFor({ timeout: 90_000 })
  await gui.validateContractInteraction(
    'div:has-text("Approve") >> button >> nth=1',
    '0xf6147b4b44ae6240f7955803b2fd5e15c77bd7ea'
  )
  await gui.validateContractInteraction(
    'button >> span:has-text("Wrap tokens") >> nth=0',
    '0xf6147b4b44ae6240f7955803b2fd5e15c77bd7ea'
  )
  await page
    .locator('reach-portal')
    .filter({ hasText: 'Transactions signed!' })
    .locator('button')
    .click()

  // Wrap USDC to saUSDC
  await page
    .getByRole('button', { name: 'Wrap AAVE tokens', exact: true })
    .click()
  await page.getByText('Max: 1,000,000').nth(0).click({ timeout: 90_000 })
  await page.getByText('Estimated gas cost:$').waitFor({ timeout: 90_000 })
  await gui.validateContractInteraction(
    'div:has-text("Approve") >> button >> nth=1',
    '0x60c384e226b120d93f3e0f4c502957b2b9c32b15'
  )
  await gui.validateContractInteraction(
    'button >> span:has-text("Wrap tokens") >> nth=0',
    '0x60c384e226b120d93f3e0f4c502957b2b9c32b15'
  )
  await page
    .locator('reach-portal')
    .filter({ hasText: 'Transactions signed!' })
    .locator('button')
    .click()

  // Wrap USDT to saUSDT
  await page
    .getByRole('button', { name: 'Wrap AAVE tokens', exact: true })
    .click()
  await page.getByText('Max: 1,000,000').nth(0).click({ timeout: 90_000 })
  await page.getByText('Estimated gas cost:$').waitFor({ timeout: 90_000 })
  await gui.validateContractInteraction(
    'div:has-text("Approve") >> button >> nth=1',
    '0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9'
  )
  await gui.validateContractInteraction(
    'button >> span:has-text("Wrap tokens") >> nth=0',
    '0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9'
  )
  await page
    .locator('reach-portal')
    .filter({ hasText: 'Transactions signed!' })
    .locator('button')
    .click()
})
