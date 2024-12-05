import { cn } from '@/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'
import React from 'react'

const boxVariants = cva('', {
  variants: {
    variant: {
      default: '', // TODO?
      circle:
        'rounded-full bg-black/5 w-6 h-6 flex items-center justify-center',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface BoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof boxVariants> {}

const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(boxVariants({ variant, className }))}
      {...props}
    />
  )
)
Box.displayName = 'Box'

export { Box, boxVariants }
