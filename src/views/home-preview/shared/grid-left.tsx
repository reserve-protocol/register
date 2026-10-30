import { Play } from 'lucide-react'
import { HEADLINE } from '../mock/ugly-cash-series'
import { EusdFlow } from './eusd-flow'
import { usd, usdCompact } from './format'
import SharpHeroChart, { HeroChartStyle } from './sharp-hero-chart'

const COPY = 'Every deposit, card swipe and transfer in UGLYCASH runs on eUSD'

export const FlowLeft = () => (
  <div className="flex w-full max-w-[560px] flex-col items-center text-center">
    <div className="hidden w-full sm:block">
      <EusdFlow />
    </div>
    <h1 className="mb-3 text-balance text-[32px] font-normal leading-[1.25] text-primary md:text-4xl">
      {COPY}
    </h1>
    <p className="flex flex-col gap-0.5 text-xl leading-[1.25]">
      <span>UGLYCASH is the car.</span>
      <span className="font-medium">eUSD is the battery.</span>
    </p>
  </div>
)

export const ChartLeft = ({ style = 'step' }: { style?: HeroChartStyle }) => (
  <div className="flex h-full w-full flex-col">
    <div className="flex flex-col gap-4 p-2 text-primary sm:p-6">
      <h1 className="max-w-[520px] text-[28px] font-normal leading-[1.2] md:text-[32px]">
        {COPY}
      </h1>
      <div>
        <p className="text-lg font-light">eUSD held in UGLYCASH</p>
        <p className="text-4xl font-semibold leading-none tabular-nums sm:text-[56px]">
          {usd(HEADLINE.balance)}
        </p>
        <p className="mt-3 text-lg">
          <span className="font-light">Moved in the last 30 days: </span>
          <span className="font-bold tabular-nums">
            {usdCompact(HEADLINE.volume30d)}
          </span>
        </p>
      </div>
      <button
        type="button"
        className="flex h-8 items-center gap-[6px] self-start rounded-[50px] border border-primary p-1 transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        <span className="ml-2 text-base">What is UGLYCASH?</span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
          <Play size={14} className="text-white" fill="#fff" />
        </span>
      </button>
    </div>
    <div className="mt-auto h-[220px] sm:h-[300px]">
      <SharpHeroChart style={style} milestones />
    </div>
  </div>
)

export const FlowChartLeft = () => (
  <div className="flex h-full w-full flex-col">
    <div className="flex flex-col items-center px-4 text-center">
      <div className="hidden w-full sm:block">
        <EusdFlow />
      </div>
      <h1 className="max-w-[560px] text-balance text-[30px] font-normal leading-[1.2] text-primary md:text-[34px]">
        {COPY}
      </h1>
    </div>
    <div className="mt-auto flex items-end justify-between gap-4 px-2 pt-8 sm:px-6">
      <div className="text-primary">
        <p className="font-light">eUSD held in UGLYCASH</p>
        <p className="text-3xl font-semibold tabular-nums sm:text-4xl">
          {usd(HEADLINE.balance)}
        </p>
      </div>
      <p className="text-right text-sm text-legend">
        Moved, 30 days
        <span className="block text-lg font-semibold text-primary tabular-nums">
          {usdCompact(HEADLINE.volume30d)}
        </span>
      </p>
    </div>
    <div className="h-[160px] sm:h-[200px]">
      <SharpHeroChart style="line" />
    </div>
  </div>
)

export const AnimLeft = ({ anim }: { anim: React.ReactNode }) => (
  <div className="flex w-full max-w-[520px] flex-col items-center text-center">
    <div className="mb-4 w-full">{anim}</div>
    <h1 className="mb-3 text-balance text-[28px] font-normal leading-[1.25] text-primary md:text-[32px]">
      {COPY}
    </h1>
    <p className="flex flex-col gap-0.5 text-lg leading-[1.25] md:text-xl">
      <span>UGLYCASH is the car.</span>
      <span className="font-medium">eUSD is the battery.</span>
    </p>
  </div>
)

// From V19 on: the flow also plays on phones (scaled to fit) and the tagline is a step smaller.
export const FlowLeftV19 = () => (
  <div className="flex w-full max-w-[520px] flex-col items-center text-center">
    <div className="w-full [--flow-h:220px] [--flow-k:0.58] sm:[--flow-h:300px] sm:[--flow-k:1]">
      <EusdFlow />
    </div>
    <h1 className="mb-3 text-balance text-[28px] font-normal leading-[1.25] text-primary md:text-[32px]">
      {COPY}
    </h1>
    <p className="flex flex-col gap-0.5 text-lg leading-[1.25] md:text-xl">
      <span>UGLYCASH is the car.</span>
      <span className="font-medium">eUSD is the battery.</span>
    </p>
  </div>
)
