import { useState } from 'react'

import {
  TransactionCompositionFrame,
  type TransactionCompositionStateGroup,
} from './transaction-composition-frame'
import {
  MANUAL_ISSUANCE_ANCHORS,
  operationForManualAnchor,
  type ManualIssuanceAnchorState,
} from './transaction-composition-manual-fixtures'
import { ManualIssuanceLedger } from './transaction-composition-manual-ledger'
import { ManualIssuanceTask } from './transaction-composition-manual-task'

const MANUAL_ISSUANCE_STATE_GROUPS = [
  { label: 'First review anchors', states: MANUAL_ISSUANCE_ANCHORS },
] as const satisfies readonly TransactionCompositionStateGroup<ManualIssuanceAnchorState>[]

export const AtomicTransactionComposition = () => (
  <TransactionCompositionFrame<ManualIssuanceAnchorState>
    id="atomic"
    model="Direct atomic · production manual issuance behavior"
    title="Manual mint and redeem"
    description="The first proof keeps the share task sufficient on the left and the basket obligation or receipt ledger on the right. It preserves direct Folio behavior without importing CoW orders or automated collateral stages."
    defaultState="Mint requirements"
    stateGroups={MANUAL_ISSUANCE_STATE_GROUPS}
    parts={[
      { label: 'Share amount and mode', status: 'Current baseline' },
      { label: 'Requirement and receipt ledger', status: 'Flow-owned' },
      { label: 'Execution and outcomes', status: 'Deferred' },
    ]}
  >
    {(state, setState) => (
      <ManualIssuanceAnchor state={state} onStateChange={setState} />
    )}
  </TransactionCompositionFrame>
)

const ManualIssuanceAnchor = ({
  onStateChange,
  state,
}: {
  onStateChange: (state: ManualIssuanceAnchorState) => void
  state: ManualIssuanceAnchorState
}) => {
  const [amount, setAmount] = useState('100')
  const operation = operationForManualAnchor(state)

  return (
    <div
      data-testid="manual-issuance-workspace"
      className="mx-auto grid w-full max-w-6xl gap-0.5 bg-secondary lg:grid-cols-2"
    >
      <ManualIssuanceTask
        amount={amount}
        onAmountChange={setAmount}
        onStateChange={onStateChange}
        operation={operation}
      />
      <ManualIssuanceLedger amount={amount} operation={operation} />
    </div>
  )
}
