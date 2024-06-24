import _manualMintingButton from '../../../components/buttons/manualMintingButton'
import _approveButton from '../../../components/manual-mint/approveButton'
import _collateralBalance from '../../../components/manual-mint/collateralBalance'
import _confirmMintButton from '../../../components/manual-mint/confirmMintButton'
import _maxButton from '../../../components/manual-mint/maxButton'
import _mintButton from '../../../components/manual-mint/mintButton'
import _transactionModal from '../../../components/manual-mint/transactionModal'
import { ERC20, ERC20_DATA } from '../../../utils/constants'
import base from '../../../fixtures/base'

const test = base()

test.describe.configure({ mode: 'serial' })

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

  const confirmMintButton = _confirmMintButton(page, 'rgusd')
  await confirmMintButton.isVisible()
  await confirmMintButton.waitForText('Please grant collateral allowance')

  // wait 0.5 sec (flaky test without this wait)
  await page.waitForTimeout(500)

  const approveButton = _approveButton(page, ERC20_DATA[ERC20.sdai]?.symbol)
  await approveButton.isVisible()
  await approveButton.click()

  await confirmMintButton.waitForText('Begin minting')
  await confirmMintButton.click()

  const transactionModal = _transactionModal(page)
  await transactionModal.isVisible()
  await transactionModal.containText('Transaction signed!')
  await transactionModal.containText('View on etherscan')
})
