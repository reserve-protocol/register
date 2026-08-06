import {
  encodeAbiParameters,
  encodeFunctionData,
  parseAbi,
  zeroAddress,
  type Address,
} from 'viem'
import { test, expect, type DtfHarness } from '../../../harness'

// Index DTF deploy wizard — Fees & Distribution precision. The DAO fee registry
// can take a fractional cut of revenue (BSC takes 1/3 → 33.33%); the wizard must
// show and split it on the same 0.01% grid its share inputs accept, or the shares
// can never total 100% and every recipient portion drifts.
test.use({ wallet: false })

const INDEX_DEPLOYER = '0x4D201a6e5BF975E2CEE9e5cbDfc803C0Ff122073' // mainnet — the form's default chain
const FEE_REGISTRY = '0x1234567890123456789012345678901234567890' as Address
const DAO_FEE_REGISTRY = '0x9980cb23' // daoFeeRegistry()
const FEE_DETAILS_ABI = parseAbi([
  'function getFeeDetails(address rToken) view returns (address recipient, uint256 feeNumerator, uint256 feeDenominator, uint256 feeFloor)',
])

// No folio exists yet, so the wizard reads the deployer's registry with the zero
// address. numerator/denominator = 1/3 → 33.333…% of revenue.
async function openFeesStep(harness: DtfHarness) {
  harness.mock
    .ethCall(
      INDEX_DEPLOYER,
      DAO_FEE_REGISTRY,
      encodeAbiParameters([{ type: 'address' }], [FEE_REGISTRY])
    )
    .ethCall(
      FEE_REGISTRY,
      encodeFunctionData({
        abi: FEE_DETAILS_ABI,
        functionName: 'getFeeDetails',
        args: [zeroAddress],
      }),
      encodeAbiParameters(
        [
          { type: 'address' },
          { type: 'uint256' },
          { type: 'uint256' },
          { type: 'uint256' },
        ],
        [FEE_REGISTRY, 1n, 3n, 0n]
      )
    )

  const { page } = harness
  await page.goto('/internal/deploy')
  await page.getByTestId('deploy-step-revenue-distribution').click()

  // 1/3 of revenue on the 0.01% grid — NOT the integer-truncated 33%.
  await expect(page.getByTestId('deploy-platform-fee')).toHaveText('33.33 %', {
    timeout: 15_000,
  })

  return page
}

test('deploy fees: hundredths-of-a-percent shares close the allocation @smoke @mobile', async ({
  harness,
}) => {
  const page = await openFeesStep(harness)

  await page.getByTestId('deploy-share-deployerShare').fill('0.01')
  await page.getByTestId('deploy-share-governanceShare').fill('66.66')

  await expect(page.getByTestId('deploy-remaining-allocation')).toHaveText('0%')
})

test('deploy fees: even distribution allocates the whole non-platform pot', async ({
  harness,
}) => {
  const page = await openFeesStep(harness)

  await page.getByTestId('deploy-even-distribution').click()

  // 66.67% over two participants — the last one absorbs the odd basis point.
  await expect(page.getByTestId('deploy-share-deployerShare')).toHaveValue(
    '33.33'
  )
  await expect(page.getByTestId('deploy-share-governanceShare')).toHaveValue(
    '33.34'
  )
  await expect(page.getByTestId('deploy-remaining-allocation')).toHaveText('0%')
})
