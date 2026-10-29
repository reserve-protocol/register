import { cn } from '@/lib/utils'
import { HEADLINE } from '../mock/ugly-cash-series'
import { EusdFlow } from './eusd-flow'
import { usd, usdCompact } from './format'
import { StageFrame } from './modern-bits'

const FlowHero = ({
  chart,
  footer,
  chartClassName,
}: {
  chart: React.ReactNode
  footer?: React.ReactNode
  chartClassName?: string
}) => (
  <StageFrame>
    <div className="relative flex flex-col overflow-hidden rounded-3xl bg-background xl:min-h-[calc(100svh-72px-8px)]">
      <div className="flex flex-col items-center px-6 pt-6 text-center">
        <div className="hidden w-full sm:block">
          <EusdFlow />
        </div>
        <h1 className="mt-6 max-w-[720px] text-[32px] font-normal leading-[1.2] text-primary sm:mt-0 md:text-[40px]">
          Every deposit, card swipe and transfer in UGLYCASH runs on eUSD
        </h1>
      </div>
      <div className="mt-10 flex flex-wrap items-end justify-between gap-4 px-6 sm:px-10 xl:mt-auto">
        <div>
          <p className="text-lg font-light text-primary">
            eUSD held in UGLYCASH
          </p>
          <p className="text-4xl font-semibold text-primary tabular-nums sm:text-5xl">
            {usd(HEADLINE.balance)}
          </p>
        </div>
        <p className="text-lg text-primary">
          <span className="font-light">Moved in the last 30 days: </span>
          <span className="font-semibold tabular-nums">
            {usdCompact(HEADLINE.volume30d)}
          </span>
        </p>
      </div>
      <div className={cn('mt-4 h-[240px] sm:h-[320px]', chartClassName)}>
        {chart}
      </div>
      {footer}
    </div>
  </StageFrame>
)

export default FlowHero
