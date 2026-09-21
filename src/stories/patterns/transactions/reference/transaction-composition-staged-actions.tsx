import { Button } from '@/components/button'
import { ActionGroup } from '@/components/design-system-v1/action-group'

import type {
  AutomatedIssuanceOperation,
  AutomatedMintReviewState,
} from './transaction-composition-staged-fixtures'

export const AutomatedMintActions = ({
  canStart = true,
  exceedsBalance = false,
  operation,
  setState,
  state,
}: {
  canStart?: boolean
  exceedsBalance?: boolean
  operation: AutomatedIssuanceOperation
  setState: (state: AutomatedMintReviewState) => void
  state: AutomatedMintReviewState
}) => {
  if (state === 'Quote searching') {
    return (
      <ActionGroup direction="vertical">
        <Button loading disabled>
          <>Fetching quotes...</>
        </Button>
        <Button tone="secondary" onClick={() => setState('Quote paused')}>
          <>Pause quote search</>
        </Button>
      </ActionGroup>
    )
  }
  if (state === 'Quote paused') {
    return (
      <Button className="w-full" onClick={() => setState('Quote searching')}>
        <>Resume quote search</>
      </Button>
    )
  }
  if (state === 'Quote unavailable' || state === 'Per-order quote failure') {
    return (
      <Button className="w-full" onClick={() => setState('Quote searching')}>
        <>Fetch quotes again</>
      </Button>
    )
  }
  if (
    state === 'Input only ready' ||
    state === 'Existing collateral ready' ||
    state === 'Existing collateral only' ||
    state === 'Price unavailable' ||
    state === 'Split order quotes'
  ) {
    return (
      <ActionGroup direction="vertical">
        <Button
          data-testid="automated-mint-start"
          disabled={exceedsBalance || !canStart}
          onClick={() => setState('Authorizing orders')}
        >
          {operation === 'mint' ? <>Start acquisition</> : <>Prepare redeem</>}
        </Button>
      </ActionGroup>
    )
  }
  if (state === 'Recoverable failure' || state === 'Cancelled order') {
    return (
      <ActionGroup direction="vertical">
        <Button
          data-testid="automated-mint-retry-failed"
          onClick={() => setState('Orders filling')}
        >
          <>Retry 1 failed order</>
        </Button>
        <Button
          tone="secondary"
          onClick={() => setState('Initial configuration')}
        >
          <>Start over</>
        </Button>
      </ActionGroup>
    )
  }
  if (state === 'Collateral ready' || state === 'No swaps needed') {
    return (
      <Button className="w-full" onClick={() => setState('Final mint signing')}>
        <>Mint CMC20</>
      </Button>
    )
  }
  if (state === 'Wallet unavailable') {
    return (
      <Button className="w-full" tone="secondary" disabled>
        <>Reconnect wallet</>
      </Button>
    )
  }
  if (state === 'Transaction failed') {
    return (
      <ActionGroup direction="vertical">
        <Button onClick={() => setState('Orders filling')}>
          <>Try again</>
        </Button>
        <Button
          tone="secondary"
          onClick={() => setState('Initial configuration')}
        >
          <>Start over</>
        </Button>
      </ActionGroup>
    )
  }
  return (
    <Button className="w-full" loading disabled>
      {state === 'Authorizing orders' ? (
        operation === 'mint' ? (
          <>Confirm collateral trades in wallet…</>
        ) : (
          <>Confirm redeem in wallet…</>
        )
      ) : state === 'Orders filling' ? (
        operation === 'mint' ? (
          <>Filling orders…</>
        ) : (
          <>Selling collateral…</>
        )
      ) : (
        <>Completing mint…</>
      )}
    </Button>
  )
}
