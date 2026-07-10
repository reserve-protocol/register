import { expect, test } from '../../fixtures/base'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'

// Smoke: the Index-DTF issuance page renders fully offline. The base fixture
// fails this test at teardown on ANY unmocked call, so a green run proves the
// issuance surface (default "swap" panel) mounts without touching a live
// boundary. Selectors are data-testid only (Lingui translates copy).

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap

test('issuance page renders the panel + mode switch offline @smoke', async ({
  page,
}) => {
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  await page.goto(dtfPath(dtf, 'issuance'))

  // The issuance container (panel-mode host) mounted.
  await expect(page.getByTestId('dtf-issuance')).toBeVisible()

  // The "Switch to Manual Mint" link renders under the swap panel (panelMode
  // defaults to 'swap', which shows the mode switch).
  await expect(page.getByTestId('issuance-mode-switch')).toBeVisible()
})
