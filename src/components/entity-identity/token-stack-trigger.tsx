import { forwardRef } from 'react'
import { Button, type ButtonProps } from '@/components/button'
import { v1Typography } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { TokenLogoStack, type TokenLogoStackItem } from './token-logo-stack'

export interface TokenStackTriggerProps extends Omit<
  ButtonProps,
  | 'children'
  | 'tone'
  | 'size'
  | 'leadingIcon'
  | 'trailingIcon'
  | 'loading'
  | 'asChild'
> {
  'aria-label': string
  tokens: TokenLogoStackItem[]
  remainingCount?: number
}

export const TokenStackTrigger = forwardRef<
  HTMLButtonElement,
  TokenStackTriggerProps
>(({ tokens, remainingCount = 0, className, ...props }, ref) => (
  <Button
    {...props}
    ref={ref}
    tone="secondary"
    size="default"
    data-slot="token-stack-trigger"
    className={cn(
      'h-11 py-0 pl-[9px]',
      remainingCount > 0 ? 'pr-4' : 'pr-3',
      className
    )}
  >
    <span aria-hidden="true" className="inline-flex items-center gap-2">
      <TokenLogoStack tokens={tokens} size={24} />
      {remainingCount > 0 && (
        <span
          data-slot="token-stack-count"
          className={cn(v1Typography.supporting, 'text-supporting-foreground')}
        >
          +{remainingCount}
        </span>
      )}
    </span>
  </Button>
))

TokenStackTrigger.displayName = 'TokenStackTrigger'
