import { Slottable, Slot } from '@radix-ui/react-slot'
import { ArrowUpRight } from 'lucide-react'
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react'

import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { v1Typography } from './typography'
import { cn } from '@/lib/utils'

export type LinkTreatment = 'inline' | 'standalone' | 'return' | 'contextual'

type LinkBaseProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  asChild?: boolean
  externalIcon?: ReactNode
  treatment?: LinkTreatment
}

export type LinkProps = LinkBaseProps &
  (
    | { external?: false; externalAnnouncement?: never }
    | { external: true; externalAnnouncement: ReactNode }
  )

const treatmentClasses: Record<LinkTreatment, string> = {
  inline:
    'underline decoration-primary/50 underline-offset-2 hover:decoration-primary',
  standalone:
    'inline-flex items-center gap-1 text-sm font-medium underline-offset-2 hover:underline',
  contextual: `inline-flex items-center gap-1 ${v1Typography.body} text-foreground underline-offset-2 hover:underline`,
  return:
    'inline-flex items-center gap-1 text-sm font-light text-muted-foreground underline-offset-2 hover:text-primary hover:underline focus-visible:text-primary focus-visible:underline',
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      asChild = false,
      children,
      className,
      external = false,
      externalAnnouncement,
      externalIcon,
      rel,
      target,
      treatment = 'inline',
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'a'
    const resolvedTarget = target ?? (external ? '_blank' : undefined)
    const relTokens = new Set(rel?.split(/\s+/).filter(Boolean) ?? [])
    if (resolvedTarget === '_blank') {
      relTokens.add('noopener')
      relTokens.add('noreferrer')
    }
    const resolvedRel = relTokens.size
      ? Array.from(relTokens).join(' ')
      : undefined

    return (
      <Comp
        ref={ref}
        target={resolvedTarget}
        rel={resolvedRel}
        data-link-treatment={treatment}
        className={cn(
          'cursor-pointer text-primary transition-colors duration-120 focus-visible:outline-none',
          roles.focus.visibleOnContent,
          treatmentClasses[treatment],
          className
        )}
        {...props}
      >
        <Slottable>{children}</Slottable>
        {external && <span className="sr-only">{externalAnnouncement}</span>}
        {external &&
          (externalIcon ?? (
            <ArrowUpRight
              aria-hidden="true"
              className={cn(
                'size-3.5 shrink-0',
                treatment === 'inline' && 'ml-1 inline'
              )}
              strokeWidth={1.5}
            />
          ))}
      </Comp>
    )
  }
)

Link.displayName = 'Link'
