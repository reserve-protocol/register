import { trackClick } from '@/hooks/useTrackPage'
import { cn } from '@/lib/utils'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import { ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

const CONTACT_EMAIL = 'support@reserve.org'
const ORBIT_SIZE = 220
const ORBIT_RADIUS = 100

const ORBIT: { key: string; label: MessageDescriptor | string }[] = [
  { key: 'app', label: msg`Your app` },
  { key: 'uglycash', label: 'UGLYCASH' },
  { key: 'card', label: msg`Your card` },
  { key: 'wallet', label: msg`Your wallet` },
]

// Apps orbit one eUSD core: many fintechs can run on the same dollar.
const EusdOrbit = () => {
  const { t } = useLingui()
  return (
    <div className="relative mx-auto h-[220px] w-[220px]" aria-hidden="true">
      <style>{`
        @keyframes home-orbit { to { transform: rotate(360deg); } }
        @keyframes home-orbit-counter { to { transform: rotate(-360deg); } }
        @keyframes home-orbit-ring { 0% { transform: scale(0.6); opacity: 0.5; } 100% { transform: scale(1.6); opacity: 0; } }
        .home-orbit { animation: home-orbit 22s linear infinite; }
        .home-orbit-label { animation: home-orbit-counter 22s linear infinite; }
        .home-orbit-ring { animation: home-orbit-ring 3s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) { .home-orbit, .home-orbit-label, .home-orbit-ring { animation: none; } }
      `}</style>
      <span className="home-orbit-ring absolute inset-[70px] rounded-full border-2 border-primary-foreground/50" />
      <span
        className="home-orbit-ring absolute inset-[70px] rounded-full border-2 border-primary-foreground/40"
        style={{ animationDelay: '1.5s' }}
      />
      <span className="absolute inset-[10px] rounded-full border border-dashed border-primary-foreground/30" />
      <div className="home-orbit absolute inset-0">
        {ORBIT.map(({ key, label }, i) => {
          const angle = (i / ORBIT.length) * 2 * Math.PI
          return (
            <span
              key={key}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: ORBIT_SIZE / 2 + ORBIT_RADIUS * Math.cos(angle),
                top: ORBIT_SIZE / 2 + ORBIT_RADIUS * Math.sin(angle),
              }}
            >
              <span
                className={cn(
                  'home-orbit-label block whitespace-nowrap rounded-full px-3 py-1 text-xs shadow-[0_8px_20px_rgba(0,0,0,0.15)]',
                  key === 'uglycash'
                    ? 'bg-foreground text-background dark:bg-background dark:text-foreground'
                    : 'bg-primary-foreground text-primary'
                )}
              >
                {typeof label === 'string' ? label : t(label)}
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
}

const FintechCard = () => {
  const { t } = useLingui()
  // A mailto link does nothing without a default mail app, so the address is also copied.
  const onClick = () => {
    trackClick('home', 'fintech_contact')
    navigator.clipboard
      ?.writeText(CONTACT_EMAIL)
      .then(() => toast.success(t`${CONTACT_EMAIL} copied to clipboard`))
      .catch(() => undefined)
  }
  return (
  <a
    href={`mailto:${CONTACT_EMAIL}`}
    onClick={onClick}
    className="group relative flex min-h-[460px] w-full flex-col justify-between overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground"
  >
    <div className="pt-4">
      <EusdOrbit />
    </div>
    <div className="relative flex flex-col gap-3">
      <p className="text-3xl leading-tight">
        <Trans>Building a fintech?</Trans>
      </p>
      <p className="max-w-[40ch] text-primary-foreground/80">
        <Trans>
          Start monetizing your stablecoin balances with eUSD the way UGLYCASH
          does.
        </Trans>
      </p>
      <span className="mt-2 inline-flex h-11 items-center gap-2 self-start rounded-full bg-primary-foreground px-5 text-primary transition-transform group-hover:translate-x-1">
        <Trans>Talk to us</Trans> <ArrowRight size={16} aria-hidden="true" />
      </span>
    </div>
  </a>
  )
}

export default FintechCard
