import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  CHART_DOCUMENTATION_METRICS,
  CHART_DOCUMENTATION_VIEWPORT_VALUES,
  DocumentationPatternCharts,
} from '../documentation-pattern-charts'
import { historicalMetrics } from '../charts/next-families/fixture-data'

beforeAll(() => {
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { ready: Promise.resolve() },
  })
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 824,
    height: 320,
    top: 0,
    right: 824,
    bottom: 320,
    left: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  })
  Object.defineProperty(SVGElement.prototype, 'getBBox', {
    configurable: true,
    value: () => ({ width: 40 }),
  })
  global.ResizeObserver = class ResizeObserver {
    constructor(private callback: ResizeObserverCallback) {}
    observe() {
      this.callback(
        [{ contentRect: { width: 824, height: 320 } } as ResizeObserverEntry],
        this
      )
    }
    unobserve() {}
    disconnect() {}
  }
})

afterEach(cleanup)
afterAll(() => vi.restoreAllMocks())

const LocationProbe = () => {
  const location = useLocation()
  return (
    <output data-testid="location-probe">
      {location.pathname}
      {location.search}
      {location.hash}
    </output>
  )
}

const renderCharts = (
  entry = '/internal/design-system/patterns#chart-overview'
) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <DocumentationPatternCharts />
      <LocationProbe />
    </MemoryRouter>
  )

describe('Chart pattern documentation', () => {
  it('presents the five accepted families in result-first anchor order', () => {
    const { container } = renderCharts()
    const sections = screen.getAllByTestId('documentation-chart-family')

    expect(sections.map(({ id }) => id)).toEqual([
      'chart-overview',
      'chart-home',
      'chart-discover',
      'chart-yield',
      'chart-portfolio',
    ])
    expect(sections[0]).toHaveAttribute(
      'data-primary-representative',
      'overview-line'
    )
    expect(
      sections[0].querySelector('[data-testid="chart-overview-source-capture"]')
    ).not.toBeNull()
    expect(
      sections[0].compareDocumentPosition(
        container.querySelector('[data-testid="chart-home-source-capture"]')!
      ) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it('preserves source-faithful renderers and live family data', () => {
    renderCharts()

    expect(screen.getByTestId('chart-overview-source-capture')).toBeVisible()
    expect(screen.getByTestId('chart-home-source-capture')).toBeVisible()
    expect(screen.getByTestId('chart-compact-capture')).toBeVisible()
    expect(screen.getAllByTestId(/next-metric-.+-review-surface/)).toHaveLength(
      4
    )
    expect(screen.getByTestId('next-portfolio-history')).toBeVisible()
    expect(screen.getByTestId('next-portfolio-history')).toHaveAttribute(
      'data-source-state',
      'total'
    )
    expect(screen.getByText(/Lab-simulated APY levels/)).toBeVisible()
    expect(
      screen.getByText(/Source-faithful PHOTON Overview rendering/)
    ).toBeVisible()
  })

  it('keeps responsive controls on live families but not the frozen Overview fixture', () => {
    renderCharts()

    expect(CHART_DOCUMENTATION_VIEWPORT_VALUES).toEqual([
      'wide',
      'narrow',
      'phone',
    ])
    const viewportControls = screen.getAllByTestId(
      'chart-documentation-viewport-control'
    )
    expect(viewportControls).toHaveLength(2)

    for (const control of viewportControls) {
      expect(
        within(control)
          .getAllByRole('radio')
          .map((item) => item.textContent)
      ).toEqual(['Wide', 'Narrow', 'Phone 390'])
    }

    expect(
      within(screen.getByTestId('chart-overview-documentation')).queryByTestId(
        'chart-documentation-viewport-control'
      )
    ).toBeNull()
    expect(screen.getByTestId('chart-overview-stage')).toHaveClass(
      'w-[824px]',
      'max-w-none'
    )
    expect(screen.getByTestId('chart-overview-scroll')).toHaveClass(
      'w-full',
      'max-w-full',
      'overflow-x-auto',
      'overscroll-x-contain'
    )
    expect(screen.getByTestId('chart-overview-scroll')).toContainElement(
      screen.getByTestId('chart-overview-stage')
    )
    expect(screen.getByTestId('chart-yield-stage')).toHaveAttribute(
      'data-documentation-viewport',
      'wide'
    )
    expect(screen.getByTestId('chart-portfolio-stage')).toHaveAttribute(
      'data-documentation-viewport',
      'wide'
    )
  })

  it('restores, repairs, and resets namespaced section state', () => {
    renderCharts(
      '/internal/design-system/patterns?chart-overview.family=area#chart-overview'
    )
    const overview = screen.getByTestId('chart-overview-documentation')

    expect(
      within(overview).getByText(
        'Unavailable family value “area”; showing “line”.'
      )
    ).toHaveTextContent('Unavailable family value “area”; showing “line”.')
    expect(
      within(overview).getByRole('radio', { name: 'Line' })
    ).toHaveAttribute('data-state', 'on')

    fireEvent.click(within(overview).getByRole('radio', { name: 'Candles' }))

    expect(screen.getByTestId('location-probe')).toHaveTextContent(
      '/internal/design-system/patterns?chart-overview.family=candles#chart-overview'
    )
    expect(
      within(overview).queryByRole('link', { name: 'State URL' })
    ).toBeNull()

    fireEvent.click(
      within(overview).getByRole('button', { name: 'Reset preview' })
    )
    expect(screen.getByTestId('location-probe')).toHaveTextContent(
      '/internal/design-system/patterns#chart-overview'
    )
  })

  it('identifies the Overview footer controls as frozen context', () => {
    renderCharts()

    expect(
      within(screen.getByTestId('chart-overview-documentation')).getByText(
        /Footer ranges and Line\/Candles labels are frozen context/
      )
    ).toBeVisible()
  })

  it('does not mount pressure or missing-data boards in Canonical', () => {
    renderCharts()

    expect(screen.queryByTestId('chart-pressure-toggle')).toBeNull()
    expect(screen.queryByTestId('next-partial-history-example')).toBeNull()
    expect(screen.queryByRole('radio', { name: 'Empty' })).toBeNull()
    expect(screen.queryByText('Technical pressure tests')).toBeNull()
    expect(
      screen.getByRole('link', { name: 'Open chart Workbench' })
    ).toHaveAttribute(
      'href',
      '/internal/design-system/workbench#pattern-charts'
    )
  })

  it('retains source objects and values without documentation-owned mutation', () => {
    const sourceObjects = [...historicalMetrics]
    const sourceValues = historicalMetrics.map(({ id, headline, points }) => ({
      id,
      headline,
      first: points.at(0),
      last: points.at(-1),
      length: points.length,
    }))

    renderCharts()

    expect(CHART_DOCUMENTATION_METRICS).toHaveLength(historicalMetrics.length)
    CHART_DOCUMENTATION_METRICS.forEach((metric, index) =>
      expect(metric).toBe(sourceObjects[index])
    )
    expect(
      historicalMetrics.map(({ id, headline, points }) => ({
        id,
        headline,
        first: points.at(0),
        last: points.at(-1),
        length: points.length,
      }))
    ).toEqual(sourceValues)
  })
})
