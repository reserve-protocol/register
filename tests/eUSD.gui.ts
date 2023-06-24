import { test } from '@guardianui/test'
import { setAllowanceAtSlot, setBalanceAtSlot } from './utils'

test('Mint eUSDC', async ({ page, gui }) => {
  // Fork Mainnet
  await gui.initializeChain(1, 17550440)

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
  await setBalanceAtSlot({
    token: '0x39aa39c021dfbae8fac545936693ac917d5e7563', // cUSDC
    slotNumber: '15',
    value: '100000000000000',
    gui,
  })
  await setBalanceAtSlot({
    token: '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9', // cUSDT
    slotNumber: '14',
    value: '100000000000000',
    gui,
  })

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
    '0x60C384e226b120d93f3e0F4C502957b2B9C32B15'
  )
  await page
    .locator('reach-portal')
    .filter({ hasText: 'Transactions signed!' })
    .locator('button')
    .click()

  await page
    .getByRole('button', { name: 'Wrap AAVE tokens', exact: true })
    .click()
  await page.getByPlaceholder('Input token amount').nth(2).type('1000000')
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

  // NOTE:
  // We need to bypass the allowance because we cannot approve
  // the collateral token one by one via the UI. The guardiantest hangs when
  // handling multiple transaction confirmations.

  await setAllowanceAtSlot({
    token: '0x60C384e226b120d93f3e0F4C502957b2B9C32B15', // saUSDC
    spender: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
    slotNumber: '2',
    value: '1000000000000000000',
    gui,
  })
  await setAllowanceAtSlot({
    token: '0x21fe646D1Ed0733336F2D4d9b2FE67790a6099D9', // saUSDT
    spender: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
    slotNumber: '2',
    value: '1000000000000000000',
    gui,
  })
  await setAllowanceAtSlot({
    token: '0x39AA39c021dfbaE8faC545936693aC917d5E7563', // cUSDC
    spender: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
    slotNumber: '16',
    value: '1000000000000000000',
    gui,
  })
  await setAllowanceAtSlot({
    token: '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9', // cUSDT
    spender: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
    slotNumber: '15',
    value: '1000000000000000000',
    gui,
  })

  await page.getByPlaceholder('Mint amount').type('10000')
  await page
    .getByText('Missing collateral')
    .waitFor({ state: 'hidden', timeout: 60_000 })

  await page.getByRole('button', { name: '+ Mint eUSD' }).click()
  await page.getByText('Collateral distribution').click()
  await gui.validateContractInteraction(
    'button >> span:has-text("Begin minting 10,000 eUSD") >> nth=0',
    '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F'
  )
})
