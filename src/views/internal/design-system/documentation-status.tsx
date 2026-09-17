import { Trans } from '@lingui/react/macro'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import type { HumanDesignStatus } from './documentation-presentation'

const STATUS_TONE: Record<HumanDesignStatus, string> = {
  accepted: 'text-primary',
  exploring: 'text-warning-foreground',
  'not-started': 'text-muted-foreground',
  'not-planned': 'text-muted-foreground',
  superseded: 'text-muted-foreground',
}

export const DocumentationStatus = ({
  status,
  children,
}: {
  status: HumanDesignStatus
  children: ReactNode
}) => (
  <span
    data-documentation-status={status}
    className={cn(
      'inline-flex items-center gap-1.5 text-xs font-medium',
      STATUS_TONE[status]
    )}
  >
    <span aria-hidden="true" className="h-px w-3 bg-current opacity-60" />
    <span className="text-muted-foreground">
      <Trans>Design</Trans>
    </span>
    <span aria-hidden="true" className="text-muted-foreground">
      ·
    </span>
    <span>{children}</span>
  </span>
)
