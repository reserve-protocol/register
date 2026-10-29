import type { ReactNode } from 'react'

import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
import {
  InlineMessage,
  InlineMessageTitle,
  type InlineMessageTone,
} from '@/components/design-system-v1/inline-message'

export const TransactionSummaryMessage = ({
  detail,
  detailLabel,
  title,
  tone = 'information',
}: {
  detail: ReactNode
  detailLabel: string
  title: string
  tone?: InlineMessageTone
}) => (
  <InlineMessage density="compact" presentation="summary" tone={tone}>
    <InlineMessageTitle className="min-w-0 flex-1">{title}</InlineMessageTitle>
    <HelpTooltip
      accessibleLabel={detailLabel}
      className="focus-visible:ring-offset-[var(--inline-message-surface)]"
      content={detail}
    />
  </InlineMessage>
)
