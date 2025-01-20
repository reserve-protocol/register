import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center cursor-pointer justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-foreground/5 disabled:text-foreground/60',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        accent:
          'bg-accent text-primary hover:bg-primary/90 hover:text-primary-foreground font-bold',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
        'outline-primary':
          'border-2 border-primary bg-transparent font-semibold text-primary hover:bg-primary hover:text-primary-foreground',
        secondary: 'bg-black text-white hover:bg-black/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        'ghost-accent': 'hover:bg-primary hover:text-white',
        link: 'text-foreground underline-offset-4 hover:text-primary',
        muted: 'text-foreground bg-border hover:bg-border/80',
      },
      size: {
        default: 'h-10 px-4 py-2',
        xs: 'h-7 rounded-md px-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-9 rounded-md w-9 px-2',
        'icon-rounded': 'h-8 rounded-full w-8 px-2',
        inline: 'h-auto p-0 m-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
