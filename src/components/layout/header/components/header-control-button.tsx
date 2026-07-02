import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

export type HeaderControlSurface = 'default' | 'transparent-header'

// Single source for the surface styling so non-button header chips (e.g. the
// connected Account pill) stay in sync with HeaderControlButton.
export const headerControlSurfaceClassName = (
  surface: HeaderControlSurface
) => (surface === 'transparent-header' ? 'border-card dark:border-border' : '')

type HeaderControlButtonProps = ButtonProps & {
  surface?: HeaderControlSurface
}

const HeaderControlButton = forwardRef<
  HTMLButtonElement,
  HeaderControlButtonProps
>(({ className, surface = 'default', type = 'button', ...props }, ref) => (
  <Button
    ref={ref}
    type={type}
    variant="none"
    size="inline"
    className={cn(
      'inline-flex h-9 cursor-pointer items-center justify-center rounded-full border bg-card transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-transparent',
      headerControlSurfaceClassName(surface),
      className
    )}
    {...props}
  />
))

HeaderControlButton.displayName = 'HeaderControlButton'

export default HeaderControlButton
