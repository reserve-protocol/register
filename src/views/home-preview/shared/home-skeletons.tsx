import { Skeleton } from '@/components/ui/skeleton'
import { Globe2 } from 'lucide-react'
import { HomeCard, TickerSkeleton } from './card-shell'
import { HERO_COPY } from './copy'

const EusdIcon = () => (
  <img src="/svgs/eusd.svg" alt="" aria-hidden="true" className="h-8 w-8" />
)

export const DataCardSkeleton = ({ title }: { title: string }) => (
  <HomeCard
    loading
    icon={<EusdIcon />}
    title={title}
    media={
      <div className="flex h-full items-end px-4 pb-3">
        <Skeleton className="h-[85%] w-full rounded-xl" />
      </div>
    }
    tickerSlot={<TickerSkeleton />}
  />
)

export const CountriesCardSkeleton = ({ title }: { title: string }) => (
  <HomeCard
    icon={
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-foreground"
        aria-hidden="true"
      >
        <Globe2 size={18} strokeWidth={1.75} />
      </span>
    }
    title={title}
    mediaClassName="h-[220px]"
    media={
      <div className="flex h-full items-center px-4">
        <Skeleton className="h-[70%] w-full rounded-xl" />
      </div>
    }
    tickerSlot={<TickerSkeleton />}
    description="Where people can open an UGLYCASH account today."
  />
)

// Mirrors AnimLeft / FlowLeftV19: same slot height for the animation, real copy below it.
export const LeftSkeleton = ({ kind }: { kind: 'globe' | 'flow' }) => (
  <div className="flex w-full max-w-[520px] flex-col items-center text-center">
    {kind === 'globe' ? (
      <div className="relative mb-4 flex h-[320px] w-full items-center justify-center">
        <Skeleton className="h-[300px] w-[300px] rounded-full" />
        <Skeleton className="absolute bottom-1 left-1/2 h-[52px] w-[224px] -translate-x-1/2 rounded-full" />
      </div>
    ) : (
      <div className="flex h-[220px] w-full items-center justify-center sm:h-[300px]">
        <Skeleton className="h-[64px] w-[200px] rounded-full" />
      </div>
    )}
    <h1 className="mb-3 text-balance text-[28px] font-normal leading-[1.25] text-primary md:text-[32px]">
      {HERO_COPY}
    </h1>
    <p className="flex flex-col gap-0.5 text-lg leading-[1.25] md:text-xl">
      <span>UGLYCASH is the car.</span>
      <span className="font-medium">eUSD is the battery.</span>
    </p>
  </div>
)

export const DATA_CARD_TITLES = [
  'eUSD held in UGLYCASH',
  'eUSD volume in UGLYCASH',
  'eUSD transactions in UGLYCASH',
] as const
