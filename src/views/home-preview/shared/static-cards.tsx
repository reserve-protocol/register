import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import uglycashCard from '../assets/uglycash-card.png'
import { AutoTicker, HomeCard } from './card-shell'
import { UglyCashLogo } from './page-bits'

export const UglyCashCardV18 = ({ shadow = true }: { shadow?: boolean }) => (
  <HomeCard
    href="https://ugly.cash"
    external
    icon={<UglyCashLogo className="h-5 self-start" />}
    title="Meet UGLYCASH"
    value="Get paid, send, save and spend in dollars"
    media={
      <div className="flex h-full items-center justify-center">
        <img
          src={uglycashCard}
          alt="The UGLYCASH Visa card"
          width={500}
          height={315}
          className={cn(
            'w-[62%] max-w-[300px] -rotate-6 rounded-xl transition-transform duration-500 group-hover:rotate-0',
            shadow && 'shadow-[0_20px_40px_rgba(0,0,0,0.2)]'
          )}
        />
      </div>
    }
    tickerSlot={
      <AutoTicker
        items={[
          { key: 'card', label: 'Visa card' },
          { key: 'account', label: 'Dollar account' },
          { key: 'transfers', label: 'Global transfers' },
          { key: 'savings', label: 'Savings' },
        ]}
      />
    }
    description="A dollar account and Visa card for people around the world. UGLYCASH is the car. eUSD is the battery."
  />
)

const ORBIT = ['Your app', 'UGLYCASH', 'Your card', 'Your wallet']

// Apps orbit one eUSD core: many fintechs can run on the same dollar (different from the hero's inflow).
const EusdOrbit = () => (
  <div className="relative mx-auto h-[220px] w-[220px]" aria-hidden="true">
    <style>{`
      @keyframes hp-orbit { to { transform: rotate(360deg); } }
      @keyframes hp-orbit-counter { to { transform: rotate(-360deg); } }
      @keyframes hp-ring { 0% { transform: scale(0.6); opacity: 0.5; } 100% { transform: scale(1.6); opacity: 0; } }
      .hp-orbit { animation: hp-orbit 22s linear infinite; }
      .hp-orbit-label { animation: hp-orbit-counter 22s linear infinite; }
      .hp-ring { animation: hp-ring 3s ease-out infinite; }
      @media (prefers-reduced-motion: reduce) { .hp-orbit, .hp-orbit-label, .hp-ring { animation: none; } }
    `}</style>
    <span className="hp-ring absolute inset-[70px] rounded-full border-2 border-white/50" />
    <span
      className="hp-ring absolute inset-[70px] rounded-full border-2 border-white/40"
      style={{ animationDelay: '1.5s' }}
    />
    <span className="absolute inset-[10px] rounded-full border border-dashed border-white/30" />
    <div className="hp-orbit absolute inset-0">
      {ORBIT.map((label, i) => {
        const angle = (i / ORBIT.length) * 2 * Math.PI
        const x = 110 + 100 * Math.cos(angle)
        const y = 110 + 100 * Math.sin(angle)
        return (
          <span
            key={label}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: x, top: y }}
          >
            <span
              className={cn(
                'hp-orbit-label block whitespace-nowrap rounded-full px-3 py-1 text-xs shadow-[0_8px_20px_rgba(0,0,0,0.15)]',
                label === 'UGLYCASH'
                  ? 'bg-foreground text-background'
                  : 'bg-card text-primary'
              )}
            >
              {label}
            </span>
          </span>
        )
      })}
    </div>
    <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      <img src="/svgs/eusd.svg" alt="" className="h-12 w-12" />
    </div>
  </div>
)

export const FintechCardV18 = () => (
  <a
    href="mailto:partners@reserve.org"
    className="group relative flex min-h-[460px] w-full flex-col justify-between overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground"
  >
    <div className="pt-4">
      <EusdOrbit />
    </div>
    <div className="relative flex flex-col gap-3">
      <p className="text-3xl leading-tight">Building a fintech?</p>
      <p className="max-w-[40ch] text-primary-foreground/80">
        Launch your own dollar app on eUSD, the way UGLYCASH did. Run it
        yourself, or we can help.
      </p>
      <span className="mt-2 inline-flex h-11 items-center gap-2 self-start rounded-full bg-card px-5 text-primary transition-transform group-hover:translate-x-1">
        Talk to us <ArrowRight size={16} aria-hidden="true" />
      </span>
    </div>
  </a>
)
