import { Trans } from '@lingui/react/macro'

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
          <Trans>Fetching quotes...</Trans>
        </Button>
        <Button tone="secondary" onClick={() => setState('Quote paused')}>
          <Trans>Pause quote search</Trans>
        </Button>
      </ActionGroup>
    )
  }
  if (state === 'Quote paused') {
    return (
      <Button className="w-full" onClick={() => setState('Quote searching')}>
        <Trans>Resume quote search</Trans>
      </Button>
    )
  }
  if (state === 'Quote unavailable' || state === 'Per-order quote failure') {
    return (
      <Button className="w-full" onClick={() => setState('Quote searching')}>
        <Trans>Fetch quotes again</Trans>
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
          {operation === 'mint' ? (
            <Trans>Start acquisition</Trans>
          ) : (
            <Trans>Prepare redeem</Trans>
          )}
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
          <Trans>Retry 1 failed order</Trans>
        </Button>
        <Button
          tone="secondary"
          onClick={() => setState('Initial configuration')}
        >
          <Trans>Start over</Trans>
        </Button>
      </ActionGroup>
    )
  }
  if (state === 'Collateral ready' || state === 'No swaps needed') {
    return (
      <Button className="w-full" onClick={() => setState('Final mint signing')}>
        <Trans>Mint CMC20</Trans>
      </Button>
    )
  }
  if (state === 'Wallet unavailable') {
    return (
      <Button className="w-full" tone="secondary" disabled>
        <Trans>Reconnect wallet</Trans>
      </Button>
    )
  }
  if (state === 'Transaction failed') {
    return (
      <ActionGroup direction="vertical">
        <Button onClick={() => setState('Orders filling')}>
          <Trans>Try again</Trans>
        </Button>
        <Button
          tone="secondary"
          onClick={() => setState('Initial configuration')}
        >
          <Trans>Start over</Trans>
        </Button>
      </ActionGroup>
    )
  }
  return (
    <Button
      className="w-full"
      tone={
        state === 'Authorizing orders' || state === 'Orders filling'
          ? 'secondary'
          : 'primary'
      }
      loading
      disabled
    >
      {state === 'Authorizing orders' ? (
        operation === 'mint' ? (
          <Trans>Confirm collateral trades in wallet…</Trans>
        ) : (
          <Trans>Confirm redeem in wallet…</Trans>
        )
      ) : state === 'Orders filling' ? (
        operation === 'mint' ? (
          <Trans>Filling orders…</Trans>
        ) : (
          <Trans>Selling collateral…</Trans>
        )
      ) : (
        <Trans>Completing mint…</Trans>
      )}
    </Button>
  )
}
