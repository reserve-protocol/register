import { test } from '@guardianui/test'
import { setAllowanceAtSlot, setBalanceAtSlot } from './utils'

// for (const rtoken of Object.keys(RTokens)) {
//   test(`Mint RToken ${rtoken}`, async ({ page, gui }) => {
//     // Fork Mainnet
//     await gui.initializeChain(1, 17586536)

//     // Go to RToken mint page
//     await page.goto(`http://localhost:3000/#/issuance?token=${rtoken}`)

//     // Block unnecessary http requests to speed up the tests
//     await page.route('**/*.{png,jpg,jpeg,webp}', (route) => route.abort())
//     await page.route(/(analytics|font|thegraph)/, (route) => route.abort())

//     // Go to RToken mint page
//     await page.goto(`http://localhost:3000/#/issuance?token=${rtoken}`)
//     await gui.setEthBalance('100000000000000000000000')

//     // const collaterals = RTokens[rtoken]
//     // for (const collateral of collaterals) {
//     //   const address = collateral[0]
//     //   const balanceSlot = collateral[1]
//     //   const allowanceSlot = collateral[2]

//     //   await setBalanceAtSlot({
//     //     token: address,
//     //     slotNumber: `${balanceSlot}`,
//     //     value: '100000000000000000000000',
//     //     gui,
//     //   })

//     //   // NOTE:
//     //   // We need to bypass the allowance because we cannot approve
//     //   // the collateral token one by one via the UI. The guardiantest hangs when
//     //   // handling multiple transaction confirmations.
//     //   await setAllowanceAtSlot({
//     //     token: address,
//     //     spender: rtoken,
//     //     slotNumber: `${allowanceSlot}`,
//     //     value: '100000000000000000000000',
//     //     gui,
//     //   })
//     // }
//     await page.reload()

//     await page.getByPlaceholder('Mint amount').type('1000')
//     await page
//       .getByText('Missing collateral')
//       .waitFor({ state: 'hidden', timeout: 60_000 })

//     await page.getByRole('button', { name: '+ Mint' }).click()
//     await page.getByText('Collateral distribution').click()
//     await gui.validateContractInteraction(
//       'button >> span:has-text("Begin minting") >> nth=0',
//       rtoken
//     )
//     await page
//       .locator('reach-portal')
//       .filter({ hasText: 'Transaction signed!' })
//       .locator('button')
//       .click()
//   })
// }
