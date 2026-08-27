import { useState } from 'react'

import { Button, InlineAction } from '@/components/button'
import {
  InlineMessage,
  InlineMessageDescription,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'
import {
  TransactionAmountObject,
  TransactionAmountPair,
  TransactionAmountRelation,
} from '@/components/design-system-v1/transaction-amount-object'
import { v1Typography } from '@/components/design-system-v1/typography'
import { LifecycleStatusPill } from '@/components/lifecycle-status'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'

import { TransactionCompositionFrame } from './transaction-composition-frame'
import {
  AutomatedMintIdentity,
  StagedOrderRow,
} from './transaction-composition-staged-support'
import { TransactionAmountAsset } from './transaction-system-assets'

const AUTOMATED_COMPOSITION_STATES = [
  'Configure',
  'Execution',
  'Outcome',
  'Recovery',
] as const

type AutomatedCompositionState = (typeof AUTOMATED_COMPOSITION_STATES)[number]

export const StagedTransactionComposition = () => (
  <TransactionCompositionFrame<AutomatedCompositionState>
    id="staged"
    defaultState="Execution"
    states={AUTOMATED_COMPOSITION_STATES}
    model="Transparent staged · current automated-mint structure"
    title="Automated mint workspace"
    description="The current flow starts as a narrow configure task. It widens only after quote creation exposes collateral orders, then preserves per-order progress, scoped retry, a separate final mint boundary, and a detailed result."
    parts={[
      {
        label: 'Amount and identity seams',
        status: 'Proposed candidate',
      },
      {
        label: 'Outcome and order presentation',
        status: 'Flow-owned',
      },
      {
        label: 'Progressive shell and CoW order rows',
        status: 'Retained current',
      },
      { label: 'SDK execution and retry policy', status: 'Flow-owned' },
    ]}
  >
    {(state) => <AutomatedWorkspace state={state} />}
  </TransactionCompositionFrame>
)

const AutomatedWorkspace = ({
  state,
}: {
  state: AutomatedCompositionState
}) => {
  if (state === 'Configure') return <ConfigureStep />
  if (state === 'Outcome') return <AutomatedOutcome />
  return <QuoteWorkspace recovery={state === 'Recovery'} />
}

const ConfigureStep = () => {
  const [amount, setAmount] = useState('10,000')
  const normalizedAmount = amount.replaceAll(',', '')
  const amountValue = {
    '10000': '$10,000.00',
    '14802.63': '$14,802.63',
  }[normalizedAmount]

  return (
    <div className="mx-auto w-full max-w-[476px] bg-card p-2 shadow-lg">
      <div className="border border-border bg-card">
        <div className="p-2">
          <header
            data-testid="automated-configure-step-content"
            className="flex items-center gap-3 px-2 pb-3 pt-2"
          >
            <StepNumber number="1" active />
            <div>
              <h4 className={v1Typography.itemTitle}>Enter USDC amount</h4>
              <p className={cn(v1Typography.supporting, roles.text.supporting)}>
                Choose the fixed input amount for this mint.
              </p>
            </div>
          </header>
          <TransactionAmountObject
            label="You provide"
            amount={amount}
            onAmountChange={setAmount}
            presentation="input"
            asset={
              <TransactionAmountAsset chain={ChainId.Base} symbol="USDC" />
            }
            supporting={amountValue ?? 'Quote updates after input'}
            balance={
              <>
                Balance{' '}
                <span className="font-medium text-foreground tabular-nums">
                  14,802.63
                </span>
              </>
            }
            balanceAction={
              <InlineAction onClick={() => setAmount('14,802.63')}>
                Max
              </InlineAction>
            }
          />
          <Button className="mt-2 w-full" disabled={!amountValue}>
            {amountValue ? 'Get quote' : 'Updating amount…'}
          </Button>
        </div>
        <UpcomingStep
          number="2"
          title="Automatically acquire assets"
          detail="We use your USDC to get the assets needed for the mint."
        />
        <UpcomingStep
          number="3"
          title="Mint CMC20"
          detail="The acquired assets are used to mint your DTF."
        />
      </div>
    </div>
  )
}

const StepNumber = ({
  active = false,
  number,
}: {
  active?: boolean
  number: string
}) => (
  <span
    className={cn(
      'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
      active
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-border text-muted-foreground'
    )}
  >
    {number}
  </span>
)

const UpcomingStep = ({
  detail,
  number,
  title,
}: {
  detail: string
  number: string
  title: string
}) => (
  <div className="border-t border-border p-4">
    <div
      data-testid="automated-configure-step-content"
      className="flex items-center gap-3"
    >
      <StepNumber number={number} />
      <div>
        <p className={v1Typography.label}>{title}</p>
        <p className={cn(v1Typography.supporting, roles.text.supporting)}>
          {detail}
        </p>
      </div>
    </div>
  </div>
)

const QuoteWorkspace = ({ recovery }: { recovery: boolean }) => (
  <div className="mx-auto grid w-full max-w-6xl gap-px bg-border xl:grid-cols-[minmax(20rem,0.86fr)_minmax(0,1.14fr)]">
    <div className="min-w-0 space-y-3 bg-card p-4 sm:p-6">
      <header>
        <h4 className={v1Typography.itemTitle}>
          {recovery ? 'Resolve failed order' : 'Filling collateral orders'}
        </h4>
        <p className={cn(v1Typography.supporting, roles.text.supporting)}>
          {recovery
            ? 'The completed order remains preserved.'
            : 'The input amount is locked while the required assets are acquired.'}
        </p>
      </header>
      <TransactionAmountPair>
        <TransactionAmountObject
          label="You provide"
          amount="10,000"
          readOnly
          presentation="input"
          asset={<TransactionAmountAsset chain={ChainId.Base} symbol="USDC" />}
          supporting="$10,000.00"
        />
        <TransactionAmountObject
          label="Estimated output"
          amount="≈99.82"
          readOnly
          presentation="output"
          asset={<TransactionAmountAsset chain={ChainId.Base} symbol="CMC20" />}
          supporting="≈$9,982.00"
        />
        <TransactionAmountRelation />
      </TransactionAmountPair>
      {recovery ? (
        <>
          <InlineMessage tone="danger">
            <InlineMessageTitle>WETH order failed</InlineMessageTitle>
            <InlineMessageDescription className="mt-1">
              The completed WBTC order remains available. Retry only the failed
              order, or start over with the original amount preserved.
            </InlineMessageDescription>
          </InlineMessage>
          <Button className="w-full">Retry 1 failed order</Button>
          <Button className="w-full" tone="secondary">
            Start over
          </Button>
        </>
      ) : (
        <Button className="w-full" loading>
          Filling orders…
        </Button>
      )}
    </div>
    <OrdersPanel recovery={recovery} />
  </div>
)

const OrdersPanel = ({ recovery }: { recovery: boolean }) => (
  <section
    className="min-w-0 bg-card p-4 sm:p-6"
    aria-labelledby="orders-title"
  >
    <div
      data-testid="staged-orders-header"
      className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
    >
      <div>
        <h5 id="orders-title" className={v1Typography.itemTitle}>
          Collateral swaps
        </h5>
        <p className={cn(v1Typography.supporting, roles.text.supporting)}>
          Basket assets bought through separate CoW orders.
        </p>
      </div>
      <span
        data-testid="staged-orders-summary"
        className="justify-self-start sm:justify-self-end"
      >
        <LifecycleStatusPill role={recovery ? 'actionable' : 'processing'}>
          1 of 2 orders filled
        </LifecycleStatusPill>
      </span>
    </div>
    <div className="mt-4 divide-y divide-border border-y border-border">
      <StagedOrderRow
        asset="WBTC"
        amount="0.0018 WBTC"
        detail="0.0018 received · CoW order 0x41C8…A12B"
        status="Filled"
        role="success"
      />
      <StagedOrderRow
        asset="WETH"
        amount="1.024 WETH"
        detail={
          recovery
            ? 'Order failed · retry does not replay WBTC'
            : 'Solver is filling the signed order'
        }
        status={recovery ? 'Failed' : 'Pending'}
        role={recovery ? 'unsuccessful' : 'processing'}
      />
      <StagedOrderRow
        asset="USDC"
        amount="6,487.20 USDC"
        detail="Existing wallet balance applied directly"
        status="Ready"
        role="success"
      />
    </div>
  </section>
)

const AutomatedOutcome = () => (
  <div className="mx-auto grid w-full max-w-6xl gap-px bg-border xl:grid-cols-[minmax(20rem,0.86fr)_minmax(0,1.14fr)]">
    <section className="space-y-5 bg-card p-4 sm:p-6">
      <header>
        <div className="flex items-center justify-between gap-3">
          <h4 className={v1Typography.itemTitle}>Mint completed</h4>
          <LifecycleStatusPill role="success">Complete</LifecycleStatusPill>
        </div>
        <p className="mt-2 text-[32px] font-light leading-[38px] tabular-nums">
          99.82 CMC20
        </p>
        <p
          className={cn('mt-1', v1Typography.supporting, roles.text.supporting)}
        >
          Final amount minted after both collateral orders filled.
        </p>
      </header>
      <dl className="grid gap-x-4 gap-y-3 border-y border-border py-3 sm:grid-cols-2">
        <OutcomeFact label="Input amount" value="10,000 USDC" />
        <OutcomeFact label="Spent" value="9,996.86 USDC" />
        <OutcomeFact label="Unused returned" value="3.14 USDC" />
        <OutcomeFact label="Leftover dust" value="$0.42 · 3 assets" />
      </dl>
      <AutomatedMintIdentity />
      <div className="flex flex-wrap justify-end gap-2">
        <Button size="compact" tone="secondary">
          New mint
        </Button>
        <Button size="compact">View DTF</Button>
      </div>
    </section>
    <section className="bg-card p-4 sm:p-6">
      <h5 className={v1Typography.itemTitle}>Completed orders</h5>
      <p className={cn(v1Typography.supporting, roles.text.supporting)}>
        Collateral swaps for this mint remain inspectable after completion.
      </p>
      <div className="mt-4 divide-y divide-border border-y border-border">
        <StagedOrderRow
          asset="WBTC"
          amount="0.0018 WBTC"
          detail="CoW order 0x41C8…A12B"
          status="Filled"
          role="success"
        />
        <StagedOrderRow
          asset="WETH"
          amount="1.024 WETH"
          detail="CoW order 0x09ED…8C44"
          status="Filled"
          role="success"
        />
      </div>
    </section>
  </div>
)

const OutcomeFact = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className={cn(v1Typography.supporting, roles.text.supporting)}>
      {label}
    </dt>
    <dd className={cn(v1Typography.itemTitle, 'mt-1 tabular-nums')}>{value}</dd>
  </div>
)
