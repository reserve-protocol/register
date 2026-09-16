import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import type { PortfolioCategory, PortfolioPoint } from './types'

export function PortfolioLegend({
  categories,
  selected,
}: {
  categories: PortfolioCategory[]
  selected?: PortfolioPoint
}) {
  return (
    <dl
      data-testid="next-portfolio-key"
      data-selected-timestamp={selected?.timestamp}
      className="flex flex-col items-stretch gap-3 px-6 pt-4 [@container(min-width:32rem)]:flex-row [@container(min-width:32rem)]:flex-wrap [@container(min-width:32rem)]:items-start [@container(min-width:32rem)]:gap-x-6"
    >
      {[...categories].reverse().map((category) => (
        <div
          key={category.key}
          data-category={category.key}
          className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2 [@container(min-width:32rem)]:w-auto [@container(min-width:32rem)]:grid-cols-[auto_auto]"
        >
          <dt className="flex min-w-0 items-baseline gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 self-center rounded-full"
              style={{ backgroundColor: category.color }}
              aria-hidden="true"
            />
            <span
              className={cn(
                'min-w-0 [@container(min-width:32rem)]:whitespace-nowrap',
                type.supporting,
                roles.text.supporting
              )}
            >
              {category.label}
            </span>
          </dt>
          <dd
            data-testid={`next-portfolio-${category.key}-amount`}
            className={cn(
              'm-0 justify-self-end whitespace-nowrap tabular-nums [@container(min-width:32rem)]:justify-self-auto',
              type.label
            )}
          >
            {selected ? `$${formatCurrency(selected[category.key])}` : '—'}
          </dd>
        </div>
      ))}
    </dl>
  )
}
