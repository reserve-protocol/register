import { test } from '@guardianui/test'
import RTokens from './RTokens.json'
import { setAllowanceAtSlot, setBalanceAtSlot } from './utils'
import { expect } from '@playwright/test';

for (const rtoken of Object.keys(RTokens)) {
  test(`Mint RToken ${rtoken} with ZAP`, async ({ page, gui }) => {
    // Fork Mainnet
    await gui.initializeChain(1, 17586536)

    // Go to RToken mint page
    await page.goto(`http://localhost:3000/#/issuance?token=${rtoken}`)

    // Block unnecessary http requests to speed up the tests
    await page.route('**/*.{png,jpg,jpeg,webp}', (route) => route.abort())
    await page.route(/(analytics|font|thegraph)/, (route) => route.abort())

    // Go to RToken mint page
    await page.goto(`http://localhost:3000/#/issuance?token=${rtoken}`)
    await gui.setEthBalance('100000000000000000000000')

    const collaterals = RTokens[rtoken]
    for (const collateral of collaterals) {
      const address = collateral[0]
      const balanceSlot = collateral[1]
      const allowanceSlot = collateral[2]

      await setBalanceAtSlot({
        token: address,
        slotNumber: `${balanceSlot}`,
        value: '100000000000000000000000',
        gui,
      })

      // NOTE:
      // We need to bypass the allowance because we cannot approve
      // the collateral token one by one via the UI. The guardiantest hangs when
      // handling multiple transaction confirmations.
      await setAllowanceAtSlot({
        token: address,
        spender: rtoken,
        slotNumber: `${allowanceSlot}`,
        value: '100000000000000000000000',
        gui,
      })
    }
    await page.reload()
    await page.waitForSelector('[data-testid="zap-switch"]', { state: 'visible' });

    const isChecked = await page.isChecked('input[type=checkbox]');
    if (!isChecked) {
      await page
      .getByTestId('zap-switch').check({ force: true, timeout: 20000 });

      expect(await page.isChecked('input[type=checkbox]')).toBeTruthy();
    }


    await page.reload()
    console.log(await page.getByPlaceholder('ETH Amount').isDisabled());
    
    await expect(page.getByPlaceholder('ETH Amount')).toBeEnabled({ enabled: true, timeout: 20000 });

    // await page.waitForTimeout(30_000);
    const zpBtn = await page.getByTestId('zap-button').isDisabled();
    // await page
    //   .getByTestId('zap-button')
    //   .waitFor({ state: 'visible', timeout: 60_000 })
    console.log(zpBtn)
    let strings = await page
    .getByTestId('zap-button').allInnerTexts();
    console.log(strings);


    await page.getByRole('button', { name: '+ Mint' }).click()
    await page.getByText('Collateral distribution').click()
    await gui.validateContractInteraction(
      'button >> span:has-text("Begin minting") >> nth=0',
      rtoken
    )
    await page
      .locator('reach-portal')
      .filter({ hasText: 'Transaction signed!' })
      .locator('button')
      .click()
  })
}
