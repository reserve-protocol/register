import { ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/button'
import { ActionGroup } from '@/components/design-system-v1/action-group'
import { OrganicBrandSurface } from '@/components/design-system-v1/organic-brand-surface'
import { TransactionAmountObject } from '@/components/design-system-v1/transaction-amount-object'
import { cn } from '@/lib/utils'
import { TransactionOutcomeStatus } from './transaction-outcome-status'
import { TransactionOutcomeDetailRow } from './transaction-outcome-detail-row'
import { transactionOutcomeMotion } from './transaction-outcome-motion'
import type { ManualSession } from './transaction-composition-manual-lifecycle'
import { TransactionWalletAction } from './transaction-wallet-action'
import { manualShareValueForAmount } from './transaction-composition-manual-fixtures'

export const ManualIssuanceOutcome = ({
  session,
  minimumHeight,
  onReset,
  onViewDtf,
  onViewTransaction,
}: {
  session: ManualSession
  minimumHeight: number
  onReset: () => void
  onViewDtf: () => void
  onViewTransaction: () => void
}) => {
  const [isWalletTracked, setIsWalletTracked] = useState(false)
  return (
    <section
      data-testid="manual-issuance-outcome"
      aria-label="Transaction successful"
      className="flex min-w-0 flex-col bg-card lg:h-full"
      style={{ minHeight: minimumHeight }}
    >
      <div className="relative isolate flex min-h-64 flex-1 flex-col text-brand-foreground">
        <OrganicBrandSurface
          className={cn('absolute inset-0', transactionOutcomeMotion.surface)}
        />
        <header
          className={cn(
            'relative z-10 flex items-center justify-between gap-4 p-4',
            transactionOutcomeMotion.content
          )}
        >
          <TransactionOutcomeStatus />
          <Button
            data-testid="manual-outcome-restart"
            size="compact"
            tone="secondary"
            onClick={onReset}
          >
            {session.operation === 'mint' ? <>New mint</> : <>New redeem</>}
          </Button>
        </header>
        <div
          className={cn(
            'relative z-10 mt-auto pb-2',
            transactionOutcomeMotion.content
          )}
        >
          <TransactionAmountObject
            label={session.operation === 'mint' ? `Minted` : `Redeemed`}
            amount={session.amount}
            unit="CMC20"
            trailingAction={
              session.operation === 'mint' ? (
                <TransactionWalletAction
                  isTracked={isWalletTracked}
                  onTrack={() => setIsWalletTracked(true)}
                />
              ) : undefined
            }
            readOnly
            presentation="output"
            tone="inverse"
            className="bg-transparent px-6"
            supporting={manualShareValueForAmount(session.amount) ?? '—'}
          />
        </div>
      </div>
      <dl className="grid shrink-0 gap-2 px-6 py-4">
        <TransactionOutcomeDetailRow label={<>Network</>} value="Ethereum" />
      </dl>
      <div data-testid="manual-outcome-footer" className="shrink-0 p-2 pt-0">
        <ActionGroup className="w-full flex-wrap">
          <Button
            data-testid="manual-outcome-view-transaction"
            tone="secondary"
            className="flex-1"
            onClick={onViewTransaction}
            trailingIcon={<ArrowUpRight aria-hidden="true" />}
          >
            <>View transaction</>
          </Button>
          <Button
            data-testid="manual-outcome-view-dtf"
            className="flex-1"
            onClick={onViewDtf}
          >
            <>View DTF</>
          </Button>
        </ActionGroup>
      </div>
    </section>
  )
}
