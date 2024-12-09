import * as React from 'react'

import { cn } from '@/lib/utils'

const Link = React.forwardRef<
  HTMLAnchorElement,
  React.HTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    target="_blank"
    className={cn(
      'flex items-center gap-1.5 hover:text-primary cursor-pointer',
      className
    )}
    {...props}
  />
))
Link.displayName = 'Link'

export { Link }
