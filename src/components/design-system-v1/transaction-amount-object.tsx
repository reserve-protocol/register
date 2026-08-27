import { ArrowDown } from 'lucide-react'
import type { HTMLAttributes, ReactNode } from 'react'

import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'

interface TransactionAmountObjectBaseProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  label: string
  amount: string
  asset: ReactNode
  supporting: ReactNode
  balance?: ReactNode
  balanceAction?: ReactNode
  presentation?: 'standalone' | 'input' | 'output'
  tone?: 'default' | 'inverse'
}

export type TransactionAmountObjectProps = TransactionAmountObjectBaseProps &
  (
    | { readOnly: true; disabled?: never; onAmountChange?: never }
    | {
        readOnly?: false
        disabled?: boolean
        onAmountChange: (value: string) => void
      }
  )

export const TransactionAmountPair = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    data-testid="transaction-amount-pair"
    className={cn('relative space-y-1', className)}
    {...props}
  />
)

export const TransactionAmountRelation = ({
  className,
}: {
  className?: string
}) => (
  <>
    <span
      aria-hidden="true"
      data-testid="transaction-amount-relation-divider"
      className={cn(
        'absolute inset-x-0 top-1/2 z-10 h-px -translate-y-1/2 bg-border',
        className
      )}
    />
    <span
      aria-hidden="true"
      data-testid="transaction-amount-relation-indicator"
      className={cn(
        'absolute left-1/2 top-1/2 z-20 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card text-foreground ring-4 ring-card',
        className
      )}
    >
      <ArrowDown className="size-4" strokeWidth={1.5} />
    </span>
  </>
)

export const TransactionAmountObject = ({
  amount,
  asset,
  balance,
  balanceAction,
  className,
  disabled = false,
  label,
  onAmountChange,
  presentation = 'standalone',
  readOnly = false,
  supporting,
  tone = 'default',
  ...props
}: TransactionAmountObjectProps) => (
  <div
    data-testid="transaction-amount-object"
    data-tone={tone}
    className={cn(
      'rounded-lg p-4 transition-colors duration-120',
      tone === 'default' &&
        presentation === 'standalone' &&
        'border border-input bg-card',
      tone === 'default' &&
        presentation === 'input' &&
        (readOnly ? roles.surface.content : roles.surface.neutralControl),
      tone === 'default' && presentation === 'output' && roles.surface.content,
      !readOnly &&
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-card',
      className
    )}
    {...props}
  >
    <div className="flex min-w-0 items-center">
      <p
        className={cn(
          v1Typography.body,
          tone === 'inverse' && 'text-primary-foreground',
          presentation === 'input' && !readOnly && 'text-primary'
        )}
      >
        {label}
      </p>
    </div>
    <div className="mt-0.5 flex min-h-10 min-w-0 items-center gap-3">
      {readOnly ? (
        <p
          className={cn(
            'min-w-0 flex-1 truncate text-[28px] font-light leading-8 tabular-nums sm:text-[32px] sm:leading-[38px]',
            tone === 'inverse'
              ? 'text-primary-foreground'
              : presentation === 'input' && !readOnly
                ? 'text-primary'
                : 'text-foreground'
          )}
        >
          {amount}
        </p>
      ) : (
        <input
          aria-label={`${label} amount`}
          className={cn(
            'min-w-0 flex-1 bg-transparent text-[28px] font-light leading-8 tabular-nums outline-none sm:text-[32px] sm:leading-[38px]',
            tone === 'inverse'
              ? 'text-primary-foreground'
              : presentation === 'input'
                ? 'text-primary'
                : 'text-foreground'
          )}
          inputMode="decimal"
          disabled={disabled}
          value={amount}
          onChange={(event) => onAmountChange?.(event.currentTarget.value)}
        />
      )}
      <div
        className={cn(
          'shrink-0',
          tone === 'inverse' &&
            '[&_[data-testid=transaction-amount-asset-identity]]:text-primary-foreground'
        )}
      >
        {asset}
      </div>
    </div>
    <div
      className={cn(
        'mt-1 flex min-h-5 min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1',
        v1Typography.supporting,
        tone === 'inverse' ? 'text-primary-foreground' : roles.text.supporting
      )}
    >
      <span className="min-w-0">{supporting}</span>
      {(balance || (!readOnly && balanceAction)) && (
        <span className="flex min-w-0 items-center gap-2">
          {balance && <span className="truncate text-right">{balance}</span>}
          {!readOnly && balanceAction}
        </span>
      )}
    </div>
  </div>
)
