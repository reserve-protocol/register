import {
  ArrowUpDown,
  ChevronDown,
  CircleHelp,
  RefreshCw,
  Settings,
  X,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ZapperModalStudy = () => (
  <section className="space-y-4" aria-labelledby="zapper-modal-study">
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="zapper-modal-study" className="text-xl font-semibold">
          Zapper modal
        </h2>
        <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-warning/30">
          Working reconstruction
        </span>
      </div>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        A focused reconstruction of the real package-owned quote-ready modal.
        Use it to judge foundations together without recreating the surrounding
        overview page or the other issuance flows.
      </p>
    </div>

    <div className="flex justify-center bg-secondary px-5 py-10">
      <ZapperModalSpecimen />
    </div>
  </section>
)

export const ZapperModalSpecimen = ({
  widthClass = 'max-w-[448px]',
  amount = '16.464247',
}: {
  widthClass?: string
  amount?: string
}) => (
  <div
    data-modal-width-specimen="standard"
    className={cn('w-full bg-card p-2 shadow-lg', widthClass)}
    aria-label="Quote-ready Zapper modal specimen"
  >
    <div className="flex items-center justify-between gap-2 px-2 pb-4 pt-2">
      <div className="flex gap-1">
        <ModalIconButton label="Open settings">
          <Settings className="h-4 w-4" />
        </ModalIconButton>
        <ModalIconButton label="Refresh quote">
          <RefreshCw className="h-4 w-4" />
        </ModalIconButton>
      </div>
      <ModalIconButton label="Close modal">
        <X className="h-4 w-4" />
      </ModalIconButton>
    </div>

    <div className="relative space-y-0.5">
      <AmountSurface
        label="You use:"
        amount="0.05"
        token="ETH"
        price="$0.05"
        balance="100.00"
        input
      />
      <button
        type="button"
        aria-label="Swap input and output tokens"
        className="absolute left-1/2 top-1/2 z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-foreground ring-2 ring-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <ArrowUpDown className="h-4 w-4" />
      </button>
      <AmountSurface
        label="You receive:"
        amount={amount}
        token="LCAP"
        price="$87.37"
        performance="+174,641.87%"
      />
    </div>

    <div className="border-t border-border">
      <div className="flex items-center justify-between gap-3 px-4 py-4 text-sm font-light text-muted-foreground">
        <span className="flex items-center gap-1">
          Quote includes fees
          <CircleHelp className="h-3.5 w-3.5" />
        </span>
        <button
          type="button"
          className="flex items-center gap-1 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Via <Zap className="h-3.5 w-3.5" /> Zap
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

    <button
      type="button"
      className="flex h-11 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      Buy LCAP
    </button>
  </div>
)

const ModalIconButton = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <button
    type="button"
    aria-label={label}
    className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  >
    {children}
  </button>
)

const AmountSurface = ({
  label,
  amount,
  token,
  price,
  balance,
  performance,
  input = false,
}: {
  label: string
  amount: string
  token: string
  price: string
  balance?: string
  performance?: string
  input?: boolean
}) => (
  <div className={`${input ? 'bg-muted' : 'bg-card'} rounded-lg p-4`}>
    <p
      className={`text-base font-light leading-6 ${input ? 'text-primary' : 'text-foreground'}`}
    >
      {label}
    </p>
    <div className="mt-0.5 flex items-center justify-between gap-3">
      <p
        className={`min-w-0 truncate text-[32px] font-light leading-9 tabular-nums ${input ? 'text-primary' : 'text-foreground'}`}
      >
        {amount}
      </p>
      <button
        type="button"
        className="flex shrink-0 items-center gap-1.5 rounded-full px-1.5 py-1 text-2xl font-light hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          className={`h-6 w-6 rounded-full ${token === 'ETH' ? 'bg-primary/50' : 'border border-border bg-card'}`}
          aria-hidden="true"
        />
        {token}
        {input && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-card">
            <ChevronDown className="h-4 w-4" />
          </span>
        )}
      </button>
    </div>
    <div className="mt-1 flex min-h-6 items-center justify-between gap-3 text-base font-light leading-6 text-muted-foreground">
      <p className="min-w-0 truncate tabular-nums">
        {price} {performance && <span>({performance})</span>}
      </p>
      {balance && (
        <div className="flex shrink-0 items-center gap-2">
          <span>
            Balance{' '}
            <strong className="font-medium text-foreground tabular-nums">
              {balance}
            </strong>
          </span>
          <button
            type="button"
            className="h-6 rounded-full bg-primary/10 px-2 text-sm font-medium text-primary"
          >
            Max
          </button>
        </div>
      )}
    </div>
  </div>
)

export default ZapperModalStudy
