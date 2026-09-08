import { useState } from 'react'

import {
  TransactionCompositionFrame,
  type TransactionCompositionStateGroup,
} from './transaction-composition-frame'
import { ManualIssuanceAnchor } from './transaction-composition-manual-anchor'
import {
  MANUAL_STATE_GROUPS,
  type ManualReviewState,
} from './transaction-composition-manual-scenarios'

const MANUAL_ISSUANCE_STATE_GROUPS =
  MANUAL_STATE_GROUPS satisfies readonly TransactionCompositionStateGroup<ManualReviewState>[]

export const AtomicTransactionComposition = () => {
  const [remembered, remember] = useState({ amount: '100', unlimited: true })
  return (
    <TransactionCompositionFrame<ManualReviewState>
      id="atomic"
      model="Direct atomic · production manual issuance behavior"
      title="Manual mint and redeem"
      description="Review configuration, permissions, direct transactions, recovery, and outcomes. The share task stays on the left and the required or expected basket stays on the right, without importing CoW orders or automated collateral stages."
      defaultState="Mint requirements"
      stageInset="flush"
      stateGroups={MANUAL_ISSUANCE_STATE_GROUPS}
      parts={[
        { label: 'Share amount and mode', status: 'Current baseline' },
        { label: 'Required and expected basket ledger', status: 'Flow-owned' },
        { label: 'Execution and outcomes', status: 'Flow-owned' },
      ]}
    >
      {(state) => (
        <ManualIssuanceAnchor
          key={state}
          state={state}
          amount={remembered.amount}
          unlimited={remembered.unlimited}
          remember={(amount, unlimited) => remember({ amount, unlimited })}
        />
      )}
    </TransactionCompositionFrame>
  )
}
