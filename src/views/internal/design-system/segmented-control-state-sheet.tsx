import { useState } from 'react'

import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'

const SegmentedControlStateSheet = () => {
  const [timeRange, setTimeRange] = useState('1m')
  const [dataType, setDataType] = useState('price')
  const [compactDataType, setCompactDataType] = useState('price')
  const [chartMode, setChartMode] = useState('chart')
  const [overviewMode, setOverviewMode] = useState('overview')

  return (
    <section data-testid="segmented-control-state-sheet" className="space-y-5">
      <div>
        <p className="text-sm font-medium text-primary">
          Accepted current baseline
        </p>
        <h2 className="mt-1 text-xl font-medium">Immediate mode selection</h2>
        <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
          This controlled single-value candidate changes an immediate mode and
          cannot be deselected. Text-only preserves the recent Index overview
          range and data-type treatment; contained reuses the accepted
          contained-selection language. Neither presentation takes Tabs panel
          semantics.
        </p>
      </div>

      <div className="grid gap-6 border border-border bg-card p-5 xl:grid-cols-2">
        <Specimen label="Text only · compact layout candidate">
          <SegmentedControl
            aria-label="Compact chart data type"
            presentation="text-only"
            textOnlyDensity="compact"
            value={compactDataType}
            onValueChange={setCompactDataType}
          >
            <SegmentedControlItem value="price">Price</SegmentedControlItem>
            <SegmentedControlItem value="market-cap">
              Market cap
            </SegmentedControlItem>
            <SegmentedControlItem value="supply" disabled>
              Supply
            </SegmentedControlItem>
          </SegmentedControl>
        </Specimen>
        <Specimen label="Text only · compact · full width mobile chart">
          <div className="max-w-sm">
            <SegmentedControl
              aria-label="Performance time range"
              presentation="text-only"
              size="compact"
              width="full"
              value={timeRange}
              onValueChange={setTimeRange}
            >
              {['1D', '7D', '1M', '3M', 'YTD', '1Y', 'ALL'].map((label) => (
                <SegmentedControlItem key={label} value={label.toLowerCase()}>
                  {label}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
          </div>
        </Specimen>
        <Specimen label="Text only · default · intrinsic">
          <SegmentedControl
            aria-label="Chart data type"
            presentation="text-only"
            value={dataType}
            onValueChange={setDataType}
          >
            <SegmentedControlItem value="price">Price</SegmentedControlItem>
            <SegmentedControlItem value="market-cap">
              Market cap
            </SegmentedControlItem>
            <SegmentedControlItem value="supply">Supply</SegmentedControlItem>
          </SegmentedControl>
        </Specimen>
        <Specimen label="Contained · compact · intrinsic">
          <SegmentedControl
            aria-label="Chart presentation"
            presentation="contained"
            size="compact"
            value={chartMode}
            onValueChange={setChartMode}
          >
            <SegmentedControlItem value="chart">Chart</SegmentedControlItem>
            <SegmentedControlItem value="table">Table</SegmentedControlItem>
          </SegmentedControl>
        </Specimen>
        <Specimen label="Contained · default · full width">
          <div className="max-w-sm">
            <SegmentedControl
              aria-label="Overview mode"
              presentation="contained"
              width="full"
              value={overviewMode}
              onValueChange={setOverviewMode}
            >
              <SegmentedControlItem value="overview">
                Overview
              </SegmentedControlItem>
              <SegmentedControlItem value="allocation">
                Allocation
              </SegmentedControlItem>
              <SegmentedControlItem value="disabled" disabled>
                Disabled
              </SegmentedControlItem>
            </SegmentedControl>
          </div>
        </Specimen>
      </div>
    </section>
  )
}

const Specimen = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="min-w-0 space-y-3">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    {children}
  </div>
)

export default SegmentedControlStateSheet
