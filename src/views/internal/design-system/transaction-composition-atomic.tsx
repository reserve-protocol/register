import { useState } from 'react'

import { Button, InlineAction } from '@/components/button'
import {
  InlineMessage,
  InlineMessageDescription,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'
import { TransactionAmountObject } from '@/components/design-system-v1/transaction-amount-object'
import { TransactionRequirementRow } from '@/components/design-system-v1/transaction-requirement-row'
import { v1Typography } from '@/components/design-system-v1/typography'
import { LifecycleStatusPill } from '@/components/lifecycle-status'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'

import { MintTransactionIdentity } from './transaction-composition-atomic-support'
import {
  TransactionCompositionFrame,
  type TransactionCompositionState,
} from './transaction-composition-frame'
import {
  TransactionAmountAsset,
  TransactionAssetIdentity,
} from './transaction-system-assets'

export const AtomicTransactionComposition = () => (
  <TransactionCompositionFrame
    id="atomic"
    model="Near-instant atomic · current manual issuance structure"
    title="Manual mint"
    description="The current page keeps one editable share goal beside persistent basket requirements. Permission progress changes the same action slot and affected rows before the final mint becomes available."
    parts={[
      { label: 'Editable field, Button, identity', status: 'Current baseline' },
      {
        label: 'Page split and approval-to-mint sequence',
        status: 'Retained current',
      },
      {
        label: 'Consequential in-context result',
        status: 'Flow-owned',
      },
    ]}
  >
    {(state) => <AtomicTask state={state} />}
  </TransactionCompositionFrame>
)

const AtomicTask = ({ state }: { state: TransactionCompositionState }) => {
  const [amount, setAmount] = useState('100')
  const requirements = getBasketRequirements(amount)
  const requirementsPending = requirements === null
  const estimatedBasketValue =
    requirements?.estimatedBasketValue ?? 'Updating estimate…'
  const approvalSummary = requirementsPending
    ? 'Updating requirements'
    : {
        Review: '2 approvals needed',
        Execution: '1 of 2 approved',
        Outcome: 'Permissions complete',
        Recovery: '1 approval needed',
      }[state]

  if (state === 'Outcome') {
    return (
      <div className="mx-auto grid w-full max-w-5xl gap-px bg-border lg:grid-cols-[minmax(16rem,0.75fr)_minmax(0,1.25fr)]">
        <section className="space-y-5 bg-card p-4 sm:p-6">
          <header>
            <div className="flex items-center justify-between gap-3">
              <h4 className={v1Typography.itemTitle}>Mint complete</h4>
              <LifecycleStatusPill role="success">Complete</LifecycleStatusPill>
            </div>
            <p className="mt-2 text-[32px] font-light leading-[38px] tabular-nums">
              {amount} CMC20 minted
            </p>
            <p
              className={cn(
                'mt-1',
                v1Typography.supporting,
                roles.text.supporting
              )}
            >
              Basket assets supplied and final mint confirmed.
            </p>
          </header>
          <dl className="grid gap-4 border-y border-border py-3 sm:grid-cols-2">
            <div>
              <dt
                className={cn(v1Typography.supporting, roles.text.supporting)}
              >
                Estimated basket value
              </dt>
              <dd className={cn(v1Typography.itemTitle, 'mt-1 tabular-nums')}>
                {estimatedBasketValue}
              </dd>
            </div>
            <div>
              <dt
                className={cn(v1Typography.supporting, roles.text.supporting)}
              >
                Minted shares
              </dt>
              <dd className={cn(v1Typography.itemTitle, 'mt-1 tabular-nums')}>
                {amount} CMC20
              </dd>
            </div>
          </dl>
          <MintTransactionIdentity />
          <div className="flex flex-wrap justify-end gap-2">
            <Button size="compact" tone="secondary">
              Mint again
            </Button>
            <Button size="compact">View DTF</Button>
          </div>
        </section>
        <div className="bg-card p-4 sm:p-6">
          <Requirements
            state={state}
            summary={approvalSummary}
            requirements={requirements}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl bg-card">
      <header className="border-b border-border p-4 sm:p-6">
        <h4 className="text-2xl font-light leading-8">Mint CMC20 manually</h4>
        <p
          className={cn(
            'mt-1 max-w-2xl',
            v1Typography.body,
            roles.text.supporting
          )}
        >
          Choose the DTF share amount, approve only the required basket assets,
          then submit the final mint.
        </p>
      </header>
      <div className="grid min-w-0 gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(16rem,0.75fr)_minmax(0,1.25fr)]">
        <div className="min-w-0 space-y-4">
          <TransactionAmountObject
            label="Shares to mint"
            amount={amount}
            {...(state === 'Execution'
              ? { readOnly: true as const }
              : { onAmountChange: setAmount })}
            presentation="input"
            asset={
              <TransactionAmountAsset chain={ChainId.Base} symbol="CMC20" />
            }
            supporting={
              estimatedBasketValue.startsWith('$')
                ? `${estimatedBasketValue} estimated basket value`
                : estimatedBasketValue
            }
            balance="Max 24.63 CMC20"
            balanceAction={
              <InlineAction onClick={() => setAmount('24.63')}>
                Use
              </InlineAction>
            }
          />
          <AtomicAction
            state={state}
            requirementsPending={requirementsPending}
          />
          <div className="border-t border-border pt-4">
            <p className={cn(v1Typography.supporting, roles.text.supporting)}>
              Having issues minting?
            </p>
            <Button className="mt-2" size="compact" tone="secondary">
              Switch to Zapper
            </Button>
          </div>
        </div>
        <Requirements
          state={state}
          summary={approvalSummary}
          requirements={requirements}
        />
      </div>
    </div>
  )
}

const AtomicAction = ({
  state,
  requirementsPending,
}: {
  state: TransactionCompositionState
  requirementsPending: boolean
}) => {
  if (state === 'Execution') {
    return (
      <div className="space-y-3">
        <InlineMessage density="compact" tone="information">
          <InlineMessageTitle>Approving basket assets</InlineMessageTitle>
          <InlineMessageDescription className="mt-1">
            WBTC is approved. Confirm the WETH permission in the wallet; the
            same action slot becomes Mint after both permissions confirm.
          </InlineMessageDescription>
        </InlineMessage>
        <Button className="w-full" loading>
          Awaiting approvals (1/2)
        </Button>
      </div>
    )
  }

  if (state === 'Recovery') {
    return (
      <div className="space-y-3">
        <InlineMessage tone="danger">
          <InlineMessageTitle>WETH approval was declined</InlineMessageTitle>
          <InlineMessageDescription className="mt-1">
            The amount and completed WBTC permission are preserved. Retry only
            the remaining approval.
          </InlineMessageDescription>
        </InlineMessage>
        <Button className="w-full" disabled={requirementsPending}>
          {requirementsPending
            ? 'Updating requirements…'
            : 'Retry remaining approval'}
        </Button>
      </div>
    )
  }

  return (
    <Button className="w-full" disabled={requirementsPending}>
      {requirementsPending ? 'Updating requirements…' : 'Approve all (2)'}
    </Button>
  )
}

const Requirements = ({
  state,
  summary,
  requirements,
}: {
  state: TransactionCompositionState
  summary: string
  requirements: BasketRequirements | null
}) => {
  const isOutcome = state === 'Outcome'
  const wbtcStatus = state === 'Review' ? 'Approval needed' : 'Approved'
  const wethStatus = {
    Review: 'Approval needed',
    Execution: 'Confirming',
    Outcome: 'Approved',
    Recovery: 'Approval declined',
  }[state]

  return (
    <section
      className="min-w-0 bg-card p-0 lg:px-0"
      aria-labelledby="basket-assets-title"
    >
      <div
        data-testid="transaction-requirements-header"
        className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
      >
        <div>
          <h5 id="basket-assets-title" className={v1Typography.itemTitle}>
            {isOutcome ? 'Basket assets used' : 'Required approvals'}
          </h5>
          <p className={cn(v1Typography.supporting, roles.text.supporting)}>
            {isOutcome
              ? 'Required amounts and starting balances remain visible with the completed permissions.'
              : 'Each basket asset keeps its own balance, requirement, and permission.'}
          </p>
        </div>
        <p className={cn(v1Typography.supporting, roles.text.supporting)}>
          {summary}
        </p>
      </div>
      <div
        data-testid="transaction-requirements-list"
        className="mt-3 border-y border-border"
      >
        <TransactionRequirementRow
          identity={
            <TransactionAssetIdentity
              chain={ChainId.Base}
              symbol="WBTC"
              name="WBTC"
              supporting="Wrapped Bitcoin"
            />
          }
          required={requirements?.wbtc ?? '—'}
          balance="0.0041 WBTC"
          balanceLabel={isOutcome ? 'Starting balance' : undefined}
          status={requirements ? wbtcStatus : 'Updating'}
          statusRole={
            requirements
              ? state === 'Review'
                ? 'actionable'
                : 'success'
              : 'processing'
          }
        />
        <TransactionRequirementRow
          identity={
            <TransactionAssetIdentity
              chain={ChainId.Base}
              symbol="WETH"
              name="WETH"
              supporting="Wrapped Ether"
            />
          }
          required={requirements?.weth ?? '—'}
          balance="1.804 WETH"
          balanceLabel={isOutcome ? 'Starting balance' : undefined}
          status={requirements ? wethStatus : 'Updating'}
          statusRole={
            !requirements
              ? 'processing'
              : state === 'Execution'
                ? 'processing'
                : state === 'Outcome'
                  ? 'success'
                  : state === 'Recovery'
                    ? 'unsuccessful'
                    : 'actionable'
          }
        />
        <TransactionRequirementRow
          identity={
            <TransactionAssetIdentity
              chain={ChainId.Base}
              symbol="USDC"
              name="USDC"
              supporting="USD Coin"
            />
          }
          required={requirements?.usdc ?? '—'}
          balance="8,219.51 USDC"
          balanceLabel={isOutcome ? 'Starting balance' : undefined}
          status={requirements ? 'Ready' : 'Updating'}
          statusRole={requirements ? 'success' : 'processing'}
        />
      </div>
    </section>
  )
}

type BasketRequirements = {
  estimatedBasketValue: string
  wbtc: string
  weth: string
  usdc: string
}

const SHARE_SCALE = 1_000_000n
const BASE_SHARE_AMOUNT = 100n * SHARE_SCALE

const getBasketRequirements = (amount: string): BasketRequirements | null => {
  const shareAmount = parseShareAmount(amount)

  if (shareAmount === null) return null

  return {
    estimatedBasketValue: formatCurrency(
      scaleFixtureValueRounded(1_004_120n, shareAmount)
    ),
    wbtc: `${formatAtomicAmount(
      scaleFixtureValue(180_000n, shareAmount),
      8,
      5,
      4
    )} WBTC`,
    weth: `${formatAtomicAmount(
      scaleFixtureValue(1_024_000_000_000_000_000n, shareAmount),
      18,
      4,
      3
    )} WETH`,
    usdc: `${formatAtomicAmount(
      scaleFixtureValue(6_487_200_000n, shareAmount),
      6,
      2,
      2
    )} USDC`,
  }
}

const parseShareAmount = (value: string): bigint | null => {
  const normalized = value.replaceAll(',', '').trim()
  const match = /^(\d{0,12})(?:\.(\d{0,6}))?$/.exec(normalized)

  if (!match || (!match[1] && !match[2])) return null

  const whole = BigInt(match[1] || '0')
  const fraction = BigInt((match[2] ?? '').padEnd(6, '0'))

  return whole * SHARE_SCALE + fraction
}

const scaleFixtureValue = (baseValue: bigint, shares: bigint) =>
  (baseValue * shares) / BASE_SHARE_AMOUNT

const scaleFixtureValueRounded = (baseValue: bigint, shares: bigint) =>
  (baseValue * shares + BASE_SHARE_AMOUNT / 2n) / BASE_SHARE_AMOUNT

const formatCurrency = (cents: bigint) => {
  const whole = (cents / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const fraction = (cents % 100n).toString().padStart(2, '0')

  return `$${whole}.${fraction}`
}

const formatAtomicAmount = (
  value: bigint,
  decimals: number,
  maximumFractionDigits: number,
  minimumFractionDigits: number
) => {
  const omittedDecimals = decimals - maximumFractionDigits
  const roundingScale = 10n ** BigInt(omittedDecimals)
  const rounded = (value + roundingScale / 2n) / roundingScale
  const displayScale = 10n ** BigInt(maximumFractionDigits)
  const whole = (rounded / displayScale)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const fraction = (rounded % displayScale)
    .toString()
    .padStart(maximumFractionDigits, '0')
    .replace(/0+$/, '')
    .padEnd(minimumFractionDigits, '0')

  return fraction ? `${whole}.${fraction}` : whole
}
