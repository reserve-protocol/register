import * as React from 'react'

import { cn } from '@/lib/utils'

const Link = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, rel, target = '_blank', ...props }, ref) => (
  <a
    ref={ref}
    target={target}
    rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
    className={cn(
      'flex items-center gap-1.5 hover:text-primary cursor-pointer',
      className
    )}
    {...props}
  />
))
Link.displayName = 'Link'

export { Link }
