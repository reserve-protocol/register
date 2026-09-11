import { Check, Copy } from 'lucide-react'
import { useLingui } from '@lingui/react/macro'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { InlineAction } from '@/components/button'
import { IconButton } from '@/components/icon-button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { isAddress, shortenAddress } from '@/utils'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { tooltipSurfaceRecipe } from './tooltip-surface'

export interface CopyableValueProps {
  value: string
  visibleValue?: ReactNode
  className?: string
  valueClassName?: string
  feedbackSide?: 'top' | 'right' | 'bottom' | 'left'
  treatment?: 'default' | 'inline'
  tone?: 'primary' | 'neutral'
}

export const CopyableValue = ({
  className,
  feedbackSide = 'top',
  treatment = 'default',
  tone = 'primary',
  value,
  valueClassName,
  visibleValue,
}: CopyableValueProps) => {
  const { t } = useLingui()
  const [isCopied, setIsCopied] = useState(false)
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const isCopiedRef = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const normalizedAddress = isAddress(value)
  const copyValue = normalizedAddress || value
  const renderedValue =
    visibleValue ??
    (normalizedAddress ? shortenAddress(normalizedAddress) : value)
  const isInline = treatment === 'inline'

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    },
    []
  )

  const handleCopy = async (event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(copyValue)
      isCopiedRef.current = true
      setIsCopied(true)
      setIsTooltipOpen(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        isCopiedRef.current = false
        setIsCopied(false)
        setIsTooltipOpen(false)
      }, 2000)
    } catch {
      // Failure presentation remains a separate unresolved policy. Never show
      // success unless the clipboard write has actually completed.
    }
  }

  const dismissFeedback = () => {
    isCopiedRef.current = false
    setIsCopied(false)
    setIsTooltipOpen(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  return (
    <span
      data-copyable-value-treatment={treatment}
      data-copyable-value-tone={tone}
      className={cn(
        'min-w-0 items-center',
        isInline ? 'inline-flex' : 'flex gap-2',
        className
      )}
    >
      <span className="sr-only">{value}</span>
      {!isInline && (
        <span
          aria-hidden="true"
          className={cn('whitespace-nowrap font-mono text-sm', valueClassName)}
        >
          {renderedValue}
        </span>
      )}
      {isCopied && (
        <span role="status" aria-live="polite" className="sr-only">
          {t`Copied to clipboard!`}
        </span>
      )}
      <TooltipProvider delayDuration={0}>
        <Tooltip
          open={isTooltipOpen}
          onOpenChange={(open) => {
            if (!isCopiedRef.current) setIsTooltipOpen(open)
          }}
        >
          <TooltipTrigger asChild>
            {isInline ? (
              <InlineAction
                aria-label={t`Copy ${copyValue} to clipboard`}
                className={cn(
                  'gap-2',
                  tone === 'neutral' &&
                    'text-foreground hover:text-primary focus-visible:text-primary active:text-primary-pressed'
                )}
                onClick={handleCopy}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'whitespace-nowrap font-mono text-sm',
                    valueClassName
                  )}
                >
                  {renderedValue}
                </span>
                {isCopied ? (
                  <Check
                    aria-hidden="true"
                    data-testid="copyable-value-inline-success-icon"
                    className="size-3.5 shrink-0 stroke-[1.5] text-success"
                  />
                ) : (
                  <Copy
                    aria-hidden="true"
                    data-testid="copyable-value-inline-copy-icon"
                    className="size-3.5 shrink-0 stroke-[1.5]"
                  />
                )}
              </InlineAction>
            ) : (
              <IconButton
                label={t`Copy to clipboard`}
                icon={<Copy aria-hidden="true" />}
                size="micro"
                tone="quiet"
                onClick={handleCopy}
              />
            )}
          </TooltipTrigger>
          <TooltipContent
            side={feedbackSide}
            sideOffset={8}
            collisionPadding={8}
            onEscapeKeyDown={dismissFeedback}
            className={cn(
              tooltipSurfaceRecipe,
              isCopied &&
                cn(
                  'animate-none border-transparent text-foreground ring-1 ring-inset transition-colors duration-120',
                  roles.feedback.success.surface,
                  roles.feedback.success.border
                )
            )}
          >
            {isCopied ? (
              <span className="flex items-center gap-2">
                <Check
                  aria-hidden="true"
                  className="size-3.5 shrink-0 stroke-[1.5] text-success"
                />
                {t`Copied to clipboard!`}
              </span>
            ) : (
              t`Copy to clipboard`
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  )
}
