import { cn } from '@/lib/utils'
import ProtocolMetrics from '@/views/home/components/protocol-metrics'
import { ArrowUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import uglycashLogo from '../assets/uglycash-logo.svg'

export const UglyCashLogo = ({ className }: { className?: string }) => (
  <img
    src={uglycashLogo}
    alt="UGLYCASH"
    className={cn('h-5 w-auto dark:invert', className)}
  />
)

// Like the current home: the glass frame steps aside once the visitor scrolls into the content.
const useScrolledPast = (threshold?: number) => {
  const [past, setPast] = useState(false)
  useEffect(() => {
    if (threshold === undefined) return
    const el = document.querySelector('div.overflow-auto.flex-grow')
    const read = () => setPast((el?.scrollTop ?? window.scrollY) > threshold)
    el?.addEventListener('scroll', read, { passive: true })
    window.addEventListener('scroll', read, { passive: true })
    return () => {
      el?.removeEventListener('scroll', read)
      window.removeEventListener('scroll', read)
    }
  }, [threshold])
  return past
}

export const FloatingStats = ({ hideAfter }: { hideAfter?: number }) => {
  const hidden = useScrolledPast(hideAfter)
  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center transition-[opacity,transform] duration-300 ease-out lg:bottom-8 lg:px-6',
        hidden && 'translate-y-4 opacity-0'
      )}
    >
      <div
        className={cn(
          'relative',
          hidden ? 'pointer-events-none' : 'pointer-events-auto'
        )}
      >
        <div className="relative flex w-full min-w-0 overflow-hidden border-t-2 border-transparent px-6 py-4 lg:w-auto lg:overflow-visible lg:rounded-full lg:border-2 lg:px-16 lg:py-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] backdrop-blur-[7px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] border-t-2 border-card bg-card/20 shadow-[0_-20px_70px_rgba(0,0,0,0.1)] lg:border-2 lg:shadow-[0_20px_70px_rgba(0,0,0,0.1)]"
          />
          <div className="relative z-10 w-full min-w-0 lg:w-auto">
            <ProtocolMetrics />
          </div>
        </div>
      </div>
    </div>
  )
}

export const DataNote = ({ className }: { className?: string }) => (
  <p className={cn('text-sm text-legend', className)}>
    UGLYCASH figures are reported by UGLYCASH as daily aggregates. UGLYCASH is
    an off-chain app, so these numbers are not read from the blockchain.
  </p>
)

export const FintechCta = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'flex flex-col gap-4 rounded-3xl bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8',
      className
    )}
  >
    <div className="flex flex-col gap-1">
      <p className="text-xl font-medium">Building a fintech?</p>
      <p className="text-legend">
        You can run eUSD yourself, or we can help you launch it.
      </p>
    </div>
    <a
      href="mailto:partners@reserve.org"
      className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-full border border-primary px-5 text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-auto"
    >
      Talk to us
      <ArrowUpRight size={16} aria-hidden="true" />
    </a>
  </div>
)

export const SandFrame = ({
  children,
  className,
  innerClassName,
}: {
  children: React.ReactNode
  className?: string
  innerClassName?: string
}) => (
  <section
    className={cn(
      'rounded-4xl border-[4px] border-secondary bg-secondary',
      className
    )}
  >
    <div
      className={cn('rounded-3xl bg-background p-6 sm:p-10', innerClassName)}
    >
      {children}
    </div>
  </section>
)
