import { X } from 'lucide-react'
import type { ReactNode } from 'react'

import { IconButton } from '@/components/icon-button'

export type TransactionSidecarEntrance = 'immediate' | 'after-outcome'

export const TransactionSidecar = ({
  children,
  contentState,
  contentTestId,
  dismissLabel,
  entrance,
  headerStart,
  kind,
  onDismiss,
}: {
  children: ReactNode
  contentState?: string
  contentTestId: string
  dismissLabel: string
  entrance: TransactionSidecarEntrance
  headerStart: ReactNode
  kind: 'advisory' | 'outcome'
  onDismiss: () => void
}) => (
  <aside
    data-testid="transaction-sidecar"
    data-sidecar-kind={kind}
    data-entrance={entrance}
    className="relative z-0 mt-1 flex w-full max-w-[420px] origin-top flex-col justify-between gap-6 rounded-none bg-gradient-to-b from-secondary to-card p-4 [animation:transaction-sidecar-grow-down_360ms_ease-out_both] motion-reduce:animate-none [@container(min-width:980px)]:absolute [@container(min-width:980px)]:bottom-6 [@container(min-width:980px)]:left-[calc(100%+0.25rem)] [@container(min-width:980px)]:top-6 [@container(min-width:980px)]:mt-0 [@container(min-width:980px)]:origin-left [@container(min-width:980px)]:[animation:transaction-sidecar-grow-out_360ms_ease-out_both] [@container(min-width:980px)_and_(max-width:1159px)]:w-[272px] [@container(min-width:1160px)]:w-[360px]"
  >
    <div
      data-testid={contentTestId}
      data-attachment={contentState}
      className="contents"
    >
      <div className="flex items-center justify-between gap-4">
        {headerStart}
        <IconButton
          label={dismissLabel}
          icon={<X />}
          size="compact"
          tone="secondary"
          onClick={onDismiss}
        />
      </div>
      {children}
    </div>
  </aside>
)
