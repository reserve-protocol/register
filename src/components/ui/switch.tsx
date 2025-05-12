import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const switchRootVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
  {
    variants: {
      variant: {
        default: 'h-6 w-11',
        small: 'h-4 w-7',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const thumbVariants = cva(
  'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform',
  {
    variants: {
      variant: {
        default: 'h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        small: 'h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

type SwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> &
  VariantProps<typeof switchRootVariants>

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, variant, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref}
    className={cn(switchRootVariants({ variant }), className)}
    {...props}
  >
    <SwitchPrimitives.Thumb className={thumbVariants({ variant })} />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
