import { test } from '@guardianui/test'
import { setBalanceAtSlot } from './utils'

test('Wrap USDC to saUSDC', async ({ page, gui }) => {
  // Fork Mainnet
  await gui.initializeChain(1)

  // Go to eUSDC mint page
  await page.goto(
    'http://localhost:3000/#/issuance?token=0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F'
  )

  await page.route('**/*.{png,jpg,jpeg,webp,svg}', (route) => route.abort())
  await page.route('/(analytics|font|thegraph)/', (route) => route.abort())

  // Mock balances
  await gui.setEthBalance('100000000000000000000000')
  await setBalanceAtSlot({
    tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
    slotNumber: '9',
    value: '100000000',
    gui,
  })

  await page
    .getByRole('button', { name: 'Wrap AAVE tokens', exact: true })
    .click()

  await page.getByText('Max: 100').nth(0).click({ timeout: 30_000 })
  await page.getByText('Estimated gas cost:$').waitFor({ timeout: 180_000 })
  await gui.validateContractInteraction(
    'div:has-text("Approve") >> button >> nth=1',
    '0x60c384e226b120d93f3e0f4c502957b2b9c32b15'
  )

  await page
    .locator('button >> span:has-text("Wrap tokens")')
    .waitFor({ timeout: 60_000 })
  await gui.validateContractInteraction(
    'button >> span:has-text("Wrap tokens")',
    '0x60C384e226b120d93f3e0F4C502957b2B9C32B15'
  )
})

test('Wrap USDT to saUSDT', async ({ page, gui }) => {
  // Fork Mainnet
  await gui.initializeChain(1)

  // Go to eUSDC mint page
  await page.goto(
    'http://localhost:3000/#/issuance?token=0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F'
  )

  // Mock balances
  await gui.setEthBalance('100000000000000000000000')
  await setBalanceAtSlot({
    tokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
    slotNumber: '2',
    value: '100000000',
    gui,
  })

  await page
    .getByRole('button', { name: 'Wrap AAVE tokens', exact: true })
    .click()

  await page.getByText('Max: 100').nth(1).click({ timeout: 30_000 })
  await page.getByText('Estimated gas cost:$').waitFor({ timeout: 180_000 })
  await gui.validateContractInteraction(
    'div:has-text("Approve") >> button >> nth=1',
    '0x60c384e226b120d93f3e0f4c502957b2b9c32b15'
  )

  await page.locator('button >> span:has-text("Wrap tokens")').waitFor()
  await gui.validateContractInteraction(
    'button >> span:has-text("Wrap tokens")',
    '0x60C384e226b120d93f3e0F4C502957b2B9C32B15'
  )
})
