import { test, expect } from '../../../harness'
import { REGISTRY } from '../../../helpers/registry'

// Manage (brand edit) route renders offline — desktop + mobile. Previously
// zero-coverage + zero-testid. The connected test wallet is NOT a brand manager,
// so the form renders with the gated (disabled) submit — a valid render state.
const base = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)!

test('manage: form renders offline @smoke @mobile', async ({ harness }) => {
  const page = harness.page
  await harness.goto(base, 'manage')
  await expect(page.getByTestId('dtf-manage')).toBeVisible({ timeout: 15_000 })
})
