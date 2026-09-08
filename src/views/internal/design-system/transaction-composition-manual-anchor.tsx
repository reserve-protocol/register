import { useReducer, useRef, useState } from 'react'
import { Trans } from '@lingui/react/macro'
import {
  InlineMessage,
  InlineMessageTitle,
  InlineMessageDescription,
} from '@/components/design-system-v1/inline-message'
import { Link } from '@/components/design-system-v1/link'
import { ManualIssuanceTask } from './transaction-composition-manual-task'
import { ManualIssuanceLedger } from './transaction-composition-manual-ledger'
import { ManualIssuanceOutcome } from './transaction-composition-manual-outcome'
import { ManualLabSimulator } from './transaction-composition-manual-simulator'
import {
  manualReducer,
  type ManualEvent,
} from './transaction-composition-manual-lifecycle'
import {
  manualScenario,
  type ManualReviewState,
} from './transaction-composition-manual-scenarios'

export const ManualIssuanceAnchor = ({
  state,
  amount,
  unlimited,
  remember,
}: {
  state: ManualReviewState
  amount: string
  unlimited: boolean
  remember: (amount: string, unlimited: boolean) => void
}) => {
  const [session, reduce] = useReducer(manualReducer, undefined, () =>
    manualScenario(state, amount, unlimited)
  )
  const taskHost = useRef<HTMLDivElement>(null)
  const [minimumHeight, setMinimumHeight] = useState(480)
  const [navigationPreview, setNavigationPreview] = useState<
    'dtf' | 'transaction' | null
  >(null)
  const dispatch = (event: ManualEvent) => {
    setNavigationPreview(null)
    const task = taskHost.current?.querySelector(
      '[data-testid="manual-issuance-task"]'
    )
    if (task) setMinimumHeight(task.getBoundingClientRect().height)
    const next = manualReducer(session, event)
    remember(next.amount, next.unlimited)
    reduce(event)
  }
  const outcome = session.transaction === 'success'
  return (
    <>
      <p
        id="manual-issuance-preview-note"
        data-testid="manual-issuance-preview-note"
        className="px-6 py-4 text-sm text-supporting-foreground"
      >
        Synthetic basket and simulated transactions; no wallet or on-chain
        writes. Use the lab controls to accept, reject, or confirm requests.
        Approve All starts separate token transactions; its USDT reset mismatch
        remains an engineering boundary. Navigation previews do not execute
        swaps.
        {outcome &&
          ' Outcome design trial: the share amount is the submitted amount. Basket amounts remain expected, not receipt-verified; no transaction hash is fabricated.'}
      </p>
      {navigationPreview && (
        <p
          data-testid="manual-navigation-preview"
          role="status"
          className="px-6 pb-4 text-sm text-supporting-foreground"
        >
          {navigationPreview === 'transaction'
            ? `Transaction preview: the confirmed ${session.operation} transaction would open on Etherscan. This simulated flow has no on-chain transaction or explorer destination.`
            : "Navigation preview: View DTF opens the same DTF's overview in production. This synthetic Ethereum basket has no deployed DTF destination."}
        </p>
      )}
      {session.gate === 'restricted' && (
        <div className="px-6 pb-4">
          <InlineMessage tone="danger">
            <InlineMessageTitle>
              <Trans>Not available in your region</Trans>
            </InlineMessageTitle>
            <InlineMessageDescription>
              <Trans>
                This product isn't available in your region due to local
                restrictions.
              </Trans>{' '}
              <Trans>
                For more information, see our{' '}
                <Link
                  href="https://reserve.org/terms-and-conditions"
                  treatment="inline"
                  external
                  externalAnnouncement=", opens in a new tab"
                >
                  Terms of Use
                </Link>
                .
              </Trans>
            </InlineMessageDescription>
          </InlineMessage>
        </div>
      )}
      <div
        ref={taskHost}
        data-testid="manual-issuance-workspace"
        className="mx-auto grid w-full max-w-[1200px] gap-0.5 bg-secondary lg:h-[46rem] lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)]"
      >
        <div className="min-w-0 bg-card lg:min-h-0 lg:overflow-y-auto">
          {outcome ? (
            <ManualIssuanceOutcome
              session={session}
              minimumHeight={minimumHeight}
              onReset={() => dispatch({ type: 'reset' })}
              onViewDtf={() => setNavigationPreview('dtf')}
              onViewTransaction={() => setNavigationPreview('transaction')}
            />
          ) : (
            <ManualIssuanceTask
              amount={session.amount}
              onAmountChange={(amount) => dispatch({ type: 'amount', amount })}
              onUnlimitedChange={(value) =>
                dispatch({ type: 'unlimited', value })
              }
              onStateChange={(state) =>
                dispatch({
                  type: 'mode',
                  operation: state === 'Redeem preview' ? 'redeem' : 'mint',
                })
              }
              operation={session.operation}
              session={session}
              dispatch={dispatch}
            />
          )}
        </div>
        <ManualIssuanceLedger
          amount={session.amount}
          operation={session.operation}
          session={session}
          dispatch={dispatch}
        />
      </div>
      <ManualLabSimulator session={session} dispatch={dispatch} />
    </>
  )
}
