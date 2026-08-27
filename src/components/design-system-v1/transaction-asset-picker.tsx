import { ChevronDown } from 'lucide-react'
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react'

import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'

export interface TransactionAssetPickerTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  identity: ReactNode
}

export const TransactionAssetPickerTrigger = forwardRef<
  HTMLButtonElement,
  TransactionAssetPickerTriggerProps
>(({ className, identity, type = 'button', ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    aria-haspopup="dialog"
    data-testid="transaction-asset-picker-trigger"
    className={cn(
      'group flex h-10 items-center gap-1 rounded-full border border-input bg-card px-2 text-foreground transition-colors duration-120',
      roles.interaction.subtleHover,
      roles.focus.onContentInset,
      'disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  >
    {identity}
    <span
      aria-hidden="true"
      data-testid="transaction-asset-picker-indicator"
      className="flex size-6 shrink-0 items-center justify-center"
    >
      <ChevronDown
        className="size-4 transition-transform duration-180 group-data-[state=open]:rotate-180"
        strokeWidth={1.5}
      />
    </span>
  </button>
))

TransactionAssetPickerTrigger.displayName = 'TransactionAssetPickerTrigger'

export const TransactionAssetPickerList = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    role="group"
    data-testid="transaction-asset-picker-list"
    className={cn('space-y-1', className)}
    {...props}
  />
)

export interface TransactionAssetPickerOptionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  identity: ReactNode
  balance: string
  selected?: boolean
}

export const TransactionAssetPickerOption = ({
  balance,
  className,
  identity,
  selected = false,
  type = 'button',
  ...props
}: TransactionAssetPickerOptionProps) => (
  <button
    type={type}
    aria-pressed={selected}
    data-testid="transaction-asset-picker-option"
    className={cn(
      'grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded p-3 text-left transition-colors duration-120 hover:bg-muted',
      roles.focus.onContent,
      selected && 'bg-accent/60',
      className
    )}
    {...props}
  >
    {identity}
    <span
      data-testid="transaction-asset-picker-balance"
      className="text-right text-sm leading-4"
    >
      <span
        className={cn('block', v1Typography.label, 'leading-4 tabular-nums')}
      >
        {balance}
      </span>
      <span
        className={cn(
          'block',
          v1Typography.supporting,
          'leading-4',
          roles.text.supporting
        )}
      >
        Balance
      </span>
    </span>
  </button>
)
