import { forwardRef, type HTMLAttributes, type SVGAttributes } from 'react'

import { cn } from '@/lib/utils'

export const Skeleton = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    data-testid="v1-skeleton"
    className={cn(
      'animate-pulse bg-border motion-reduce:animate-none',
      className
    )}
    {...props}
  />
))

Skeleton.displayName = 'Skeleton'

export interface SpinnerProps extends SVGAttributes<SVGSVGElement> {
  label?: string
  size?: 14 | 16 | 24
}

export const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, label, size = 16, ...props }, ref) => (
    <svg
      ref={ref}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('animate-spin motion-reduce:animate-none', className)}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
        className="opacity-20"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
)

Spinner.displayName = 'Spinner'
