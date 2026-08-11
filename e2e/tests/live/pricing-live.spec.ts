import { expect, test } from '../../fixtures/base'
import {
  basketDrift,
  describeBasketDrift,
  LIVE_ENV_VARS,
  liveConfig,
  liveGet,
} from '../../helpers/live'
import { dtfPath, REGISTRY } from '../../helpers/registry'
import { loadSnapshot } from '../../helpers/snapshots'

// Pricing rendered from the LIVE reserve API (@live) — the non-quote half of the
// validation suite.
//
//   E2E_LIVE_RESERVE_API=production pnpm e2e:live
//
// The overview header price and the price chart are the two surfaces that turn
// /current/dtf + /historical/dtf into pixels. The request-level contract spec
// proves the payload's shape; this proves register RENDERS it — a schema-valid
// response that leaves the header on its skeleton, or a timeseries the chart
// cannot plot, fails here only.
//
// Values are NOT asserted (live prices move); the oracle is "a price was
// rendered in the app's own money format, and the chart has a plotted path".
// RPC/subgraph stay mocked, so the DTF identity and basket are the deterministic
// ones from the snapshots while every price comes from the deployment.

test.describe.configure({ timeout: 120_000 })

const config = liveConfig()

test.describe('@live pricing surfaces against the live reserve API', () => {
  test.skip(
    !config.reserve,
    `set ${LIVE_ENV_VARS.reserve} (e.g. production) to run the live pricing flow`
  )

  for (const dtf of REGISTRY.filter((entry) => !entry.deprecated)) {
    test(`overview renders a live price for ${dtf.slug} (${dtf.chain})`, async ({
      page,
      request,
      unmockedCalls,
      liveViolations,
      boundaryRequests,
    }) => {
      // Precondition, not a product assertion: the SDK joins the API basket with
      // the (mocked, pinned) chain state by address, so a basket that moved since
      // the last capture can never render. Say so explicitly.
      const { data } = await liveGet(
        request,
        config.reserve!,
        `/current/dtf?address=${dtf.address.toLowerCase()}&chainId=${dtf.chainId}`,
        liveViolations
      )
      const drift = describeBasketDrift(
        basketDrift(loadSnapshot(`${dtf.snapshotDir}/current-price.json`), data)
      )
      test.skip(
        drift.length > 0,
        `${dtf.slug}: live basket ${drift.join(' ')} vs the pinned chain-state ` +
          `snapshot — the SDK cannot join them, run \`pnpm e2e:capture\` to ` +
          `validate this DTF's pricing UI (docs/wiki/progress.md § E2E coverage debt)`
      )

      await page.goto(dtfPath(dtf, 'overview'))

      // Header price: skeleton -> value. `$0` would mean the response landed but
      // carried no usable price, so the money format is asserted, not just text.
      const price = page.getByTestId('overview-dtf-price')
      await expect(price).toHaveText(/^\$[\d,]+(\.\d+)?$/, { timeout: 60_000 })
      await expect(price).not.toHaveText(/^\$0(\.0+)?$/)

      // Chart: plotted geometry, not just the container — proves the live
      // series was consumed and is plottable. The default chart type is
      // candlestick (recharts bars); the line type draws an area curve.
      const chart = page.getByTestId('overview-price-chart')
      await expect(chart.locator('svg').first()).toBeVisible({ timeout: 60_000 })
      const plotted = chart.locator(
        'svg .recharts-bar-rectangle, svg .recharts-area-curve'
      )
      await expect
        .poll(() => plotted.count(), { timeout: 60_000, message: 'chart plotted nothing' })
        .toBeGreaterThan(0)

      // The price came from the live API, with the identity register is
      // expected to send.
      const priceRequests = boundaryRequests.filter(
        (entry) => entry.boundary === 'api' && entry.pathname.includes('/current/dtf')
      )
      expect(priceRequests.length, 'no /current/dtf request recorded').toBeGreaterThan(0)
      expect(
        priceRequests.some(
          (entry) =>
            entry.boundary === 'api' &&
            entry.search.address?.toLowerCase() === dtf.address.toLowerCase()
        ),
        '/current/dtf must be requested for this DTF address'
      ).toBe(true)

      expect(unmockedCalls).toEqual([])
    })
  }
})
