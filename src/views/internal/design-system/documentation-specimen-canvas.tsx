import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import type { DocumentationSpecimenFallback } from './use-documentation-specimen-state'

const CONTROL_SLOTS = [
  'family',
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
  family: msg`Family / variant`,
  operation: msg`Operation`,
  step: msg`Step`,
  state: msg`State`,
  viewport: msg`Viewport`,
  identity: msg`Identity`,
}

export type DocumentationSpecimenCanvasProps = {
  host: {
    name: string
    backgroundOwner: string
    insetOwner: string
  }
  controls?: Partial<Record<DocumentationControlSlot, ReactNode>>
  reset?: ReactNode
  link?: ReactNode
  fallbacks?: readonly DocumentationSpecimenFallback[]
  provenance?: ReactNode
  children: ReactNode
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
            <ControlSlot label={t`Link`} slot="link">
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
        className={cn('min-w-0 overflow-x-auto bg-background', hostClassName)}
        data-background-owner={host.backgroundOwner}
        data-host-context={host.name}
        data-inset-owner={host.insetOwner}
      >
        <p className="py-2 text-xs leading-4 text-muted-foreground">
          <Trans>
            {host.name} host · Background: {host.backgroundOwner} · Inset:{' '}
            {host.insetOwner}
          </Trans>
        </p>
        <div
          className={cn(
            'min-w-0 border border-dashed border-border',
            specimenClassName
          )}
          data-specimen-boundary
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
