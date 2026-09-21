import { useRef, useState } from 'react'
import {
  InlineMessage,
  InlineMessageTitle,
  InlineMessageDescription,
} from '@/components/design-system-v1/inline-message'
import { Link } from '@/components/design-system-v1/link'
import { ManualIssuanceTask } from './transaction-composition-manual-task'
import { ManualIssuanceLedger } from './transaction-composition-manual-ledger'
import { ManualIssuanceOutcome } from './transaction-composition-manual-outcome'
import { type ManualEvent } from './transaction-composition-manual-lifecycle'
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
  const [previewState, setPreviewState] = useState(state)
  const session = manualScenario(previewState, amount, unlimited)
  const taskHost = useRef<HTMLDivElement>(null)
  const [minimumHeight, setMinimumHeight] = useState(480)
  const dispatch = (event: ManualEvent) => {
    if (event.type === 'amount') remember(event.amount, unlimited)
    if (event.type === 'unlimited') remember(amount, event.value)
    if (event.type === 'mode') {
      const task = taskHost.current?.querySelector(
        '[data-testid="manual-issuance-task"]'
      )
      if (task) setMinimumHeight(task.getBoundingClientRect().height)
      setPreviewState(
        event.operation === 'redeem' ? 'Redeem preview' : 'Mint requirements'
      )
    }
  }
  const outcome = session.transaction === 'success'
  return (
    <>
      {session.gate === 'restricted' && (
        <div className="px-6 pb-4">
          <InlineMessage tone="danger">
            <InlineMessageTitle>
              <>Not available in your region</>
            </InlineMessageTitle>
            <InlineMessageDescription>
              <>
                This product isn't available in your region due to local
                restrictions.
              </>{' '}
              <>
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
              </>
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
              onViewDtf={() => {}}
              onViewTransaction={() => {}}
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
    </>
  )
}
