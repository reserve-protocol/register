import { useState } from 'react'

import type { ChartPanelState } from '@/components/design-system-v1/chart-panel'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import {
  v1Typography as type,
  v1TypographyVariants,
} from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import {
  ActivityChart,
  ActivityRangeControl,
  type ActivityLayout,
} from './activity-chart-example'
import type { ActivityRange } from './activity-chart-fixtures'

export interface ActivityDashboardProps {
  layout: ActivityLayout
  state: ChartPanelState
}

export function ActivityDashboard({ layout, state }: ActivityDashboardProps) {
  const [range, setRange] = useState<ActivityRange>('30d')

  return (
    <div
      data-testid="activity-dashboard"
      className={cn('w-full', roles.surface.content)}
    >
      <div
        className={cn(
          'mx-auto grid max-w-[1400px] gap-0.5',
          roles.surface.structural
        )}
      >
        <header
          className={cn(
            'px-5 pb-6 pt-8 lg:px-6 lg:pt-12',
            roles.surface.content
          )}
        >
          <h1
            className={cn(
              v1TypographyVariants.responsivePageTitle,
              roles.text.pageHeadline
            )}
          >
            eUSD activity
          </h1>
          <p className={cn('mt-2', type.body, roles.text.supporting)}>
            Daily transactions that change eUSD balances.
          </p>
          <div className="mt-6">
            <ActivityRangeControl value={range} onChange={setRange} />
          </div>
        </header>

        <div className="grid gap-0.5 lg:grid-cols-2">
          {(['volume', 'count'] as const).map((measure) => (
            <div
              key={measure}
              data-testid={`activity-dashboard-${measure}`}
              className={cn('min-w-0', roles.surface.content)}
            >
              <ActivityChart
                measure={measure}
                layout={layout}
                state={state}
                range={range}
                headline="panel"
              />
            </div>
          ))}
          <section
            aria-labelledby="activity-dashboard-countries"
            data-testid="activity-dashboard-countries"
            className={cn(
              'min-w-0 px-5 py-5 lg:col-span-2 lg:px-6 lg:py-6',
              roles.surface.content
            )}
          >
            <h2
              id="activity-dashboard-countries"
              className={cn(type.body, roles.text.supporting)}
            >
              Active countries
            </h2>
            <p
              className={cn(
                'mt-4 flex h-48 items-center justify-center border border-dashed border-border px-5 text-center',
                type.supporting,
                roles.text.supporting
              )}
            >
              Map placeholder: the countries map is not built yet.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
