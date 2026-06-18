import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/utils/constants'
import { Trans } from '@lingui/react/macro'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { HIGHLIGHTED_LIMIT } from './constants'

const DISCOVER_PRODUCT_ICONS = [
  {
    label: 'CMC20',
    src: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxhO6t9I2BbMt4sV2Y6jmzwPSZ3Hrav0gfieuo',
  },
  {
    label: 'LCAP',
    src: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxBVjyB3T4H9uivWURqQkxfgFXD7tedNTwsYoS',
  },
  {
    label: 'OPEN',
    src: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxqD7AIQfxfH57h2mseoNual3tKBRCYyvnS1E8',
  },
  {
    label: 'ETH+',
    src: 'https://app.reserve.org/svgs/ethplus.svg',
  },
  {
    label: 'USD3',
    src: 'https://app.reserve.org/svgs/usd3.svg',
  },
]

export const HighlightedDTFEndCard = ({
  fullWidth,
}: {
  fullWidth: boolean
}) => (
  <Link
    to={ROUTES.DISCOVER}
    className={cn(
      'group flex h-full w-full rounded-3xl border-[4px] border-card bg-secondary transition-shadow',
      'min-h-[300px] hover:bg-card hover:shadow-sm md:min-h-[460px]',
      fullWidth && 'lg:col-span-2'
    )}
  >
    <div
      className={cn(
        'flex h-full w-full flex-col justify-between rounded-2xl bg-secondary p-5 text-left',
        'group-hover:bg-card dark:bg-card dark:group-hover:bg-secondary'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            'flex -space-x-2 rounded-full border border-card bg-card p-1.5',
            'group-hover:border-primary dark:bg-secondary'
          )}
        >
          {DISCOVER_PRODUCT_ICONS.map((icon, index) => (
            <img
              key={icon.label}
              src={icon.src}
              alt={icon.label}
              width={20}
              height={20}
              loading="lazy"
              decoding="async"
              className="rounded-full border-2 border-card bg-card dark:border-secondary"
              style={{ zIndex: 5 - index }}
            />
          ))}
        </div>
        <span
          className={cn(
            'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-card bg-card text-primary',
            'transition-[background-color,color] group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground',
            'dark:bg-secondary dark:text-foreground'
          )}
        >
          <ArrowRight size={18} />
        </span>
      </div>
      <div className="max-w-64">
        <span className="block text-xl font-normal leading-tight text-primary transition-colors dark:text-foreground dark:group-hover:text-primary">
          <Trans>Discover all our products</Trans>
        </span>
        <span className="mt-2 block text-sm leading-5 text-legend">
          <Trans>
            Explore DTFs across broad crypto, ecosystems, yield strategies and
            more.
          </Trans>
        </span>
      </div>
    </div>
  </Link>
)

export const HighlightedDTFEndCardPlaceholder = ({
  fullWidth,
}: {
  fullWidth: boolean
}) => (
  <div
    className={cn(
      'group flex h-full w-full rounded-3xl border-[4px] border-card bg-secondary transition-shadow',
      'min-h-[300px] md:min-h-[460px]',
      fullWidth && 'lg:col-span-2'
    )}
    aria-hidden="true"
  >
    <div className="flex h-full w-full flex-col justify-between rounded-2xl bg-secondary p-5 text-left dark:bg-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex -space-x-2 rounded-full border border-card bg-card p-1.5 dark:bg-secondary">
          {Array.from({ length: HIGHLIGHTED_LIMIT }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-5 w-5 rounded-full border-2 border-card bg-card dark:border-secondary"
              style={{ zIndex: HIGHLIGHTED_LIMIT - index }}
            />
          ))}
        </div>
        <Skeleton className="h-9 w-9 shrink-0 rounded-full border border-card bg-card" />
      </div>
      <div className="max-w-64">
        <Skeleton className="h-6 w-52 max-w-full" />
        <div className="mt-2 space-y-1.5">
          <Skeleton className="h-4 w-64 max-w-full" />
          <Skeleton className="h-4 w-48 max-w-full" />
        </div>
      </div>
    </div>
  </div>
)
