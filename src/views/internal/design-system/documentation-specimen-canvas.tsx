import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import type { DocumentationSpecimenFallback } from './use-documentation-specimen-state'

const CONTROL_SLOTS = [
  'family',
  'size',
  'operation',
  'step',
  'state',
  'viewport',
  'identity',
] as const

export type DocumentationControlSlot = (typeof CONTROL_SLOTS)[number]

const CONTROL_LABELS: Record<
  DocumentationControlSlot,
  ReturnType<typeof msg>
> = {
  family: msg`Example`,
  size: msg`Size`,
  operation: msg`Operation`,
  step: msg`Phase`,
  state: msg`State`,
  viewport: msg`Width`,
  identity: msg`Identity`,
}

export type DocumentationSpecimenMode =
  | 'intrinsic'
  | 'fluid'
  | 'full-canvas'
  | 'host-constrained'

export type DocumentationSpecimenBackdrop =
  | 'white'
  | 'neutral'
  | 'beige'
  | 'transparent'

export type DocumentationSpecimenPadding = 'contained' | 'compact' | 'none'
export type DocumentationSpecimenAlignment = 'start' | 'center'

export type DocumentationSpecimenCanvasProps = {
  host: {
    name: string
    backdropOwner: string
    insetOwner: string
  }
  controls?: Partial<Record<DocumentationControlSlot, ReactNode>>
  reset?: ReactNode
  link?: ReactNode
  fallbacks?: readonly DocumentationSpecimenFallback[]
  provenance?: ReactNode
  children: ReactNode
  mode?: DocumentationSpecimenMode
  backdrop?: DocumentationSpecimenBackdrop
  padding?: DocumentationSpecimenPadding
  align?: DocumentationSpecimenAlignment
  stableHeight?: 'compact' | 'standard' | 'tall'
  className?: string
  hostClassName?: string
  specimenClassName?: string
}

const ControlSlot = ({
  slot,
  label,
  children,
}: {
  slot: DocumentationControlSlot | 'reset' | 'link'
  label: string
  children: ReactNode
}) => (
  <div className="min-w-32" data-specimen-control-slot={slot}>
    <p className="mb-1 text-xs leading-4 text-muted-foreground">{label}</p>
    <div
      className="flex min-h-11 items-stretch [&>*]:min-h-11"
      data-specimen-control-target
    >
      {children}
    </div>
  </div>
)

const DocumentationSpecimenCanvas = ({
  host,
  controls,
  reset,
  link,
  fallbacks = [],
  provenance,
  children,
  mode = 'fluid',
  backdrop = 'white',
  padding = 'contained',
  align = 'start',
  stableHeight,
  className,
  hostClassName,
  specimenClassName,
}: DocumentationSpecimenCanvasProps) => {
  const { t } = useLingui()
  const hasControls =
    CONTROL_SLOTS.some((slot) => controls?.[slot] !== undefined) ||
    reset !== undefined ||
    link !== undefined

  return (
    <section className={cn('min-w-0', className)} data-documentation-layer>
      {hasControls ? (
        <div
          className="flex flex-wrap items-end gap-3 border-y border-border py-3"
          data-specimen-control-bar
        >
          {CONTROL_SLOTS.map((slot) => {
            const control = controls?.[slot]
            return control === undefined ? null : (
              <ControlSlot
                key={slot}
                label={t(CONTROL_LABELS[slot])}
                slot={slot}
              >
                {control}
              </ControlSlot>
            )
          })}
          {reset !== undefined ? (
            <ControlSlot label={t`Reset`} slot="reset">
              {reset}
            </ControlSlot>
          ) : null}
          {link !== undefined ? (
            <ControlSlot label={t`More`} slot="link">
              {link}
            </ControlSlot>
          ) : null}
        </div>
      ) : null}

      {fallbacks.length ? (
        <p
          className="py-2 text-xs leading-4 text-muted-foreground"
          role="status"
        >
          {fallbacks
            .map(
              ({ dimension, requestedValue, fallbackValue }) =>
                t`Unavailable ${dimension.replaceAll('-', ' ')} value “${requestedValue}”; showing “${fallbackValue}”.`
            )
            .join(' ')}
        </p>
      ) : null}

      <div
        className={cn(
          'min-w-0 overflow-x-auto',
          backdrop === 'white' && 'bg-background',
          backdrop === 'neutral' && 'bg-muted/20',
          backdrop === 'beige' && 'bg-secondary',
          backdrop === 'transparent' && 'bg-transparent',
          hostClassName
        )}
        data-backdrop-owner={host.backdropOwner}
        data-host-context={host.name}
        data-inset-owner={host.insetOwner}
        data-specimen-backdrop={backdrop}
      >
        <p className="py-2 text-xs leading-4 text-muted-foreground">
          <span className="font-medium text-foreground">
            <Trans>Context</Trans>
          </span>{' '}
          · {host.name}
        </p>
        <div
          className={cn(
            'min-w-0 border border-dashed border-border',
            padding === 'contained' && 'p-5 sm:p-8',
            padding === 'compact' && 'p-4',
            padding === 'none' && 'p-0',
            align === 'center' &&
              'flex items-center justify-center max-md:items-start',
            stableHeight === 'compact' && 'min-h-64',
            stableHeight === 'standard' && 'min-h-[32rem]',
            stableHeight === 'tall' && 'min-h-[44rem]',
            specimenClassName
          )}
          data-specimen-boundary
          data-specimen-mode={mode}
          data-specimen-padding={padding}
          data-specimen-align={align}
          data-specimen-stable-height={stableHeight}
        >
          {children}
        </div>
      </div>

      {provenance !== undefined ? (
        <div className="pt-2 text-xs leading-4 text-muted-foreground">
          {provenance}
        </div>
      ) : null}
    </section>
  )
}

export default DocumentationSpecimenCanvas
