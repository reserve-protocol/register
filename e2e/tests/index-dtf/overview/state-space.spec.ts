import { test, expect } from '../../../harness'
import { REGISTRY } from '../../../helpers/registry'

// Overview state-space: a deprecated/inactive DTF shows the inactive badge (the
// sell-only / deprecated UX) — desktop + mobile. Status is a synchronous
// dtf-catalog lookup (no fetch — the fixture DTF must be catalog-listed);
// the badge keys on a testid (label is Lingui-translated).
const deprecated = REGISTRY.find((d) => d.deprecated)!

test('overview deprecated DTF: inactive badge renders @smoke @mobile', async ({ harness }) => {
  const page = harness.page
  await harness.goto(deprecated, 'overview')
  await expect(page.getByTestId('overview-dtf-name')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByTestId('overview-inactive-badge')).toBeVisible({ timeout: 15_000 })
})
