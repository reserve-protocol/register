import base from '../fixtures/base'
import _account from '../components/account'
import _input from '../components/input'
import _error from '../components/error'
import _connectWalletButton from '../components/buttons/connectWalletButton'

const test = base()

test.describe.configure({ mode: 'serial' })

test('Wallet connected', async ({ page, web3 }) => {
  await page.goto('/')

  const account = _account(page)
  await account.isVisible()
})

test('Disconnect wallet', async ({ page, web3 }) => {
  await page.goto('/')

  const account = _account(page)
  await account.isVisible()
  await account.openSidebar()
  await account.openAccountModal()
  await account.disconnectWallet()
})

test('Numerical Input', async ({ page, web3 }) => {
  const ethPlusAddress = '0xe72b141df173b999ae7c1adcbf60cc9833ce56a8'
  await page.goto(`/ethereum/token/${ethPlusAddress}/issuance`)

  const input = _input(page)
  await input.isVisible()
  await input.input('1.234')

  const error = _error(page, 'mint')
  await error.isVisible()
  await error.expectedMessage('Insufficient funds')

  await input.clearInput()
  await error.isNotVisible()
})

test('Connect wallet button', async ({ page }) => {
  const ethPlusAddress = '0xe72b141df173b999ae7c1adcbf60cc9833ce56a8'
  await page.goto(`/ethereum/token/${ethPlusAddress}/issuance`)

  const connectWalletButton = _connectWalletButton(page)
  await connectWalletButton.isVisible()
})
