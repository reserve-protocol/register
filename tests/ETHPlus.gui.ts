import { test } from '@guardianui/test'
import { setAllowanceAtSlot, setBalanceAtSlot } from './utils'

test('Mint ETH+', async ({ page, gui }) => {
  // Fork Mainnet
  await gui.initializeChain(1, 17547538)

  // Go to eUSDC mint page
  await page.goto(
    'http://localhost:3000/#/issuance?token=0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8'
  )

  // Block unnecessary http requests to speed up the tests
  await page.route('**/*.{png,jpg,jpeg,webp}', (route) => route.abort())
  await page.route(/(analytics|font|thegraph)/, (route) => route.abort())

  // Mock balances
  await gui.setEthBalance('100000000000000000000000')
  await setBalanceAtSlot({
    token: '0xae78736cd615f374d3085123a210448e74fc6393', // rETH
    slotNumber: '1',
    value: '10000000000000000000000',
    gui,
  })
  await setBalanceAtSlot({
    token: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0', // wsETH
    slotNumber: '0',
    value: '10000000000000000000000',
    gui,
  })

  // NOTE:
  // We need to bypass the allowance because we cannot approve
  // the collateral token one by one via the UI. The guardiantest hangs when
  // handling multiple transaction confirmations.
  await setAllowanceAtSlot({
    token: '0xae78736cd615f374d3085123a210448e74fc6393', // rETH
    spender: '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8',
    slotNumber: '2',
    value: '10000000000000000000000',
    gui,
  })
  await setAllowanceAtSlot({
    token: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', // wsETH
    spender: '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8',
    slotNumber: '1',
    value: '10000000000000000000000',
    gui,
  })

  await page.getByPlaceholder('Mint amount').type('100')
  await page.getByRole('button', { name: '+ Mint ETH+' }).click()
  await page.getByText('Collateral distribution').click()

  await gui.validateContractInteraction(
    'button >> span:has-text("Begin minting 100 ETH+") >> nth=0',
    '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8'
  )
})
