import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'

import { CopyableValue } from '@/components/design-system-v1/copyable-value'
import { Link } from '@/components/design-system-v1/link'
import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'

export interface TransactionIdentityProps {
  label: string
  value: string
  visibleValue: string
  network: string
  networkMark: ReactNode
  explorerLabel: string
  explorerHref: string
  externalAnnouncement: string
}

export const TransactionIdentity = ({
  explorerHref,
  explorerLabel,
  externalAnnouncement,
  label,
  network,
  networkMark,
  value,
  visibleValue,
}: TransactionIdentityProps) => (
  <div data-testid="transaction-identity-block">
    <p className={cn(v1Typography.supporting, roles.text.supporting)}>
      {label}
    </p>
    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
      <CopyableValue value={value} visibleValue={visibleValue} />
      <span className="flex flex-wrap items-center gap-2">
        <span className="flex size-6 items-center justify-center">
          {networkMark}
        </span>
        <span className={v1Typography.label}>{network}</span>
        <Link
          href={explorerHref}
          treatment="standalone"
          external
          externalAnnouncement={externalAnnouncement}
          externalIcon={
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          }
        >
          {explorerLabel}
        </Link>
      </span>
    </div>
  </div>
)
