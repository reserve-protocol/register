import _account from '../components/account'
import _connectWalletButton from '../components/buttons/connectWalletButton'
import _manualMintingButton from '../components/buttons/manualMintingButton'
import _error from '../components/error'
import _input from '../components/input'
import _collateralBalance from '../components/manual-mint/collateralBalance'
import _maxButton from '../components/manual-mint/maxButton'
import _mintButton from '../components/manual-mint/mintButton'
import _approveButton from '../components/manual-mint/approveButton'
import { ERC20, ERC20_DATA } from '../utils/constants'
import base from '../fixtures/base'

const test = base()

test.describe.configure({ mode: 'serial' })

// test('Wallet connected', async ({ page, web3 }) => {
//   await page.goto('/')

//   const account = _account(page)
//   await account.isVisible()
// })

// test('Disconnect wallet', async ({ page, web3 }) => {
//   await page.goto('/')

//   const account = _account(page)
//   await account.isVisible()
//   await account.openSidebar()
//   await account.openAccountModal()
//   await account.disconnectWallet()
// })

// test('Numerical Input', async ({ page, web3 }) => {
//   const ethPlusAddress = '0xe72b141df173b999ae7c1adcbf60cc9833ce56a8'
//   await page.goto(`/ethereum/token/${ethPlusAddress}/issuance`)

//   const input = _input(page)
//   await input.isVisible()
//   await input.input('1.234')

//   const error = _error(page, 'mint')
//   await error.isVisible()
//   await error.expectedMessage('Insufficient funds')

//   await input.clearInput()
//   await error.isNotVisible()
// })

// test('Connect wallet button', async ({ page }) => {
//   const ethPlusAddress = '0xe72b141df173b999ae7c1adcbf60cc9833ce56a8'
//   await page.goto(`/ethereum/token/${ethPlusAddress}/issuance`)

//   const connectWalletButton = _connectWalletButton(page)
//   await connectWalletButton.isVisible()
// })

test('Manual mint', async ({ page, web3 }) => {
  await web3.setBalance({
    [ERC20.sdai]: '1000',
  })

  const rgUSDAddress = '0x78da5799cf427fee11e9996982f4150ece7a99a7'
  await page.goto(`/ethereum/token/${rgUSDAddress}/issuance`)

  const manualMintingButton = _manualMintingButton(page)
  await manualMintingButton.isVisible()
  await manualMintingButton.click()

  const collateralBalance = _collateralBalance(
    page,
    ERC20_DATA[ERC20.sdai]?.symbol
  )
  await collateralBalance.isVisible()
  await collateralBalance.expectedBalance('1,000.00')

  const maxButton = _maxButton(page, 'mint')
  await maxButton.isVisible()
  await maxButton.hasValue()
  await maxButton.click()

  const mintButton = _mintButton(page)
  await mintButton.isVisible()
  await mintButton.click()

  const approveButton = _approveButton(page, ERC20_DATA[ERC20.sdai]?.symbol)
  await approveButton.isVisible()
  await approveButton.click()

  // wait 30 secs
  await page.waitForTimeout(30000)
})
