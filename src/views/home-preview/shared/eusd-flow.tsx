import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CreditCard,
  PiggyBank,
  Send,
} from 'lucide-react'

// Category chips (never amounts) drift into eUSD: every kind of activity settles in the same dollar.
const CHIPS = [
  {
    label: 'Deposit',
    Icon: ArrowDownToLine,
    x: '-260px',
    y: '-70px',
    delay: 0,
  },
  { label: 'Card', Icon: CreditCard, x: '250px', y: '-90px', delay: 0.9 },
  { label: 'Send', Icon: Send, x: '-240px', y: '80px', delay: 1.8 },
  { label: 'Save', Icon: PiggyBank, x: '270px', y: '60px', delay: 2.7 },
  {
    label: 'Withdraw',
    Icon: ArrowUpFromLine,
    x: '-30px',
    y: '-140px',
    delay: 3.6,
  },
]

const FlowStyles = () => (
  <style>{`
    @keyframes hp-flow-in {
      0% { transform: translate(var(--fx), var(--fy)) scale(1); opacity: 0; }
      15% { opacity: 1; }
      70% { opacity: 1; }
      100% { transform: translate(0, 0) scale(0.4); opacity: 0; }
    }
    @keyframes hp-pill-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
    .hp-chip { animation: hp-flow-in 4.5s cubic-bezier(.45,0,.2,1) infinite; }
    .hp-pill { animation: hp-pill-pulse 0.9s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) {
      .hp-chip { animation: none; transform: translate(var(--fx), var(--fy)); opacity: 1; }
      .hp-pill { animation: none; }
    }
  `}</style>
)

export const EusdFlow = () => (
  <div className="relative flex h-[var(--flow-h,300px)] w-full items-center justify-center">
    <FlowStyles />
    {CHIPS.map(({ label, Icon, x, y, delay }) => (
      <span
        key={label}
        aria-hidden="true"
        className="hp-chip absolute flex items-center gap-2 rounded-full border-2 border-card bg-card/80 px-3 py-1.5 text-sm shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur"
        style={
          {
            '--fx': `calc(${x} * var(--flow-k, 1))`,
            '--fy': `calc(${y} * var(--flow-k, 1))`,
            animationDelay: `${delay}s`,
          } as React.CSSProperties
        }
      >
        <Icon size={14} className="text-primary" />
        {label}
      </span>
    ))}
    <div className="hp-pill relative z-10 flex items-center gap-3 rounded-full border-2 border-primary bg-card py-2 pl-2 pr-6">
      <img
        src="/svgs/eusd.svg"
        alt=""
        aria-hidden="true"
        className="h-12 w-12"
      />
      <div className="flex flex-col leading-tight">
        <span className="text-primary">eUSD</span>
        <span className="text-sm text-legend">Reserve's dollar</span>
      </div>
    </div>
  </div>
)
