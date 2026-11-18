import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export const ExplorerHeader = ({
  title,
  subtitle,
  children,
}: {
  title: ReactNode
  subtitle?: ReactNode
  children?: ReactNode
}) => (
  <header className="flex flex-wrap items-end gap-x-4 gap-y-3 px-5 sm:px-3">
    <div className="flex min-w-0 flex-col gap-1">
      <h1 className="text-[26px] font-semibold leading-tight text-primary sm:text-[32px]">
        {title}
      </h1>
      {subtitle && (
        <p className="text-base tabular-nums" data-testid="explorer-subtitle">
          {subtitle}
        </p>
      )}
    </div>
    {children && <div className="ml-auto">{children}</div>}
  </header>
)

export const ExplorerSubtitle = ({
  value,
  children,
}: {
  value: ReactNode
  children?: ReactNode
}) => (
  <>
    <span className="font-semibold">{value}</span>
    {children && <span className="text-legend"> · {children}</span>}
  </>
)

export const ExplorerCard = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => (
  <section
    className={cn(
      'overflow-hidden rounded-t-3xl bg-card sm:rounded-4xl sm:border-4 sm:border-secondary',
      className
    )}
  >
    {children}
  </section>
)

export const ExplorerToolbar = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-2 gap-2 p-3 sm:flex sm:flex-wrap sm:items-center sm:px-5 sm:py-3.5">
    {children}
  </div>
)
