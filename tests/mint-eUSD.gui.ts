import { test } from '@guardianui/test'
import { setBalanceAtSlot } from './utils'

test('Mint eUSDC', async ({ page, gui }) => {
  // Fork Mainnet
  await gui.initializeChain(1, 17533748)

  // Go to eUSDC mint page
  await page.goto(
    'http://localhost:3000/#/issuance?token=0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F'
  )
  await page.waitForTimeout(30 * 1000)

  // Mock balances
  await gui.setEthBalance('100000000000000000000000')
  await setBalanceAtSlot({
    tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    slotNumber: '9',
    value: '100000000',
    gui,
  })
  await setBalanceAtSlot({
    tokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    slotNumber: '2',
    value: '100000000',
    gui,
  })

  // await gui.setBalance(
  //   '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
  //   '100000000'
  // )
  // await gui.setBalance(
  //   '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
  //   '100000000'
  // )
  // await gui.setBalance(
  //   '0x39aa39c021dfbae8fac545936693ac917d5e7563', // cUSDC
  //   '10000000000'
  // )
  // await gui.setBalance(
  //   '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9', // cUSDT
  //   '10000000000'
  // )

  // NOTE: Wallet is automatically connected by Guardian Test

  // Wrap USDC and USDC to Static AAVE tokens
  await page
    .getByRole('button', { name: 'Wrap AAVE tokens', exact: true })
    .click()

  await page.getByText('Max: 100').nth(0).click()
  await page.getByText('Max: 100').nth(1).click()

  await page.getByText('Estimated gas cost:$').waitFor()
  await gui.validateContractInteraction(
    'div:has-text("Approve") >> button >> nth=1',
    '0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9'
  )
})
