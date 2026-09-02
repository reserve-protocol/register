import { InlineAction } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
import {
  TransactionAmountObject,
  TransactionAmountDirectionControl,
  TransactionAmountPair,
  TransactionAmountRelation,
} from '@/components/design-system-v1/transaction-amount-object'
import { transactionTaskGeometry } from '@/components/design-system-v1/transaction-task-geometry'
import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'

import type { StakeReviewState } from './transaction-composition-stake-support'
import { getStakeFixtureQuote } from './transaction-composition-stake-fixtures'
import { TransactionAmountAsset } from './transaction-system-assets'

export const StakeTransactionTask = ({
  acknowledged,
  onAcknowledgedChange,
  onDirectionChange,
  onStakeAmountChange,
  onUnstakeAmountChange,
  stakeAmount,
  state,
  unstakeAmount,
}: {
  acknowledged: boolean
  onAcknowledgedChange: (checked: boolean) => void
  onDirectionChange: () => void
  onStakeAmountChange: (amount: string) => void
  onUnstakeAmountChange: (amount: string) => void
  stakeAmount: string
  state: StakeReviewState
  unstakeAmount: string
}) => {
  const isUnstake = state.startsWith('Unstake')
  const isFailure = state === 'Stake failed' || state === 'Unstake failed'
  const isInputState =
    state === 'Stake amount' ||
    state === 'Approval' ||
    state === 'Stake ready' ||
    state === 'Unstake amount'
  const showAcknowledgement = !isUnstake && isInputState
  const hasSubmittedContentBoundary =
    !isInputState &&
    (state === 'Approval signing' ||
      state === 'Stake wallet' ||
      state === 'Stake confirming' ||
      state === 'Stake processing' ||
      state === 'Unstake wallet' ||
      state === 'Unstake confirming' ||
      state === 'Unstake processing' ||
      isFailure)
  const amount = isUnstake ? unstakeAmount : stakeAmount
  const quote = getStakeFixtureQuote(isUnstake ? 'unstake' : 'stake', amount)

  return (
    <div data-testid="stake-transaction-task">
      <TransactionAmountPair
        className={cn(
          hasSubmittedContentBoundary &&
            transactionTaskGeometry.submittedContentBoundary
        )}
        data-task-boundary={hasSubmittedContentBoundary ? 'leading' : undefined}
      >
        <TransactionAmountObject
          data-testid="stake-input-amount"
          label={isUnstake ? 'You unstake:' : 'You stake:'}
          amount={amount}
          {...(isInputState
            ? {
                onAmountChange: isUnstake
                  ? onUnstakeAmountChange
                  : onStakeAmountChange,
              }
            : { readOnly: true })}
          presentation="input"
          asset={
            <TransactionAmountAsset
              chain={ChainId.Mainnet}
              symbol={isUnstake ? 'stRSR' : 'RSR'}
            />
          }
          supporting={quote?.usdValue ?? '—'}
          balance={isUnstake ? 'Balance 1,420 stRSR' : 'Balance 4,250 RSR'}
          balanceAction={
            isInputState ? (
              <InlineAction
                onClick={() =>
                  isUnstake
                    ? onUnstakeAmountChange('1420')
                    : onStakeAmountChange('4250')
                }
              >
                Max
              </InlineAction>
            ) : undefined
          }
        />
        <TransactionAmountObject
          data-testid="stake-output-amount"
          label={isUnstake ? 'Available after delay:' : 'You receive:'}
          amount={quote?.outputAmount ?? '—'}
          readOnly
          presentation="output"
          asset={
            <TransactionAmountAsset
              chain={ChainId.Mainnet}
              symbol={isUnstake ? 'RSR' : 'stRSR'}
            />
          }
          supporting={quote?.usdValue ?? '—'}
        />
        {isInputState ? (
          <TransactionAmountDirectionControl
            label={isUnstake ? 'Switch to stake' : 'Switch to unstake'}
            onClick={onDirectionChange}
          />
        ) : (
          <TransactionAmountRelation />
        )}
      </TransactionAmountPair>

      <div
        data-testid="stake-task-facts-region"
        className={transactionTaskGeometry.factsRegion}
      >
        <dl className="grid gap-2 px-4 py-4">
          <StakeFact label="Exchange rate" value="1 stRSR = 1.14384 RSR" />
          {isUnstake ? (
            <>
              <StakeFact label="Unstaking delay" value="14 days" />
              <StakeFact label="Staking yield share ends" value="Immediate" />
            </>
          ) : null}
        </dl>
        {showAcknowledgement && (
          <div
            data-testid="stake-delay-acknowledgement"
            className="flex items-center gap-2 px-4 py-4"
          >
            <Checkbox
              id="stake-delay-acknowledgement"
              checked={acknowledged}
              onCheckedChange={onAcknowledgedChange}
              aria-label="Acknowledge unstake delay"
            />
            <label
              htmlFor="stake-delay-acknowledgement"
              className={cn(
                v1Typography.label,
                'min-w-0 flex-1 cursor-pointer'
              )}
            >
              I&apos;m aware of the 14-day unstake delay
            </label>
            <HelpTooltip
              accessibleLabel="About the 14-day unstake delay"
              side="top"
              content={
                <span>
                  If you decide to unstake in the future, you&apos;ll need to
                  wait 14 days until you can complete the withdrawal
                </span>
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}

const StakeFact = ({ label, value }: { label: string; value: string }) => (
  <div
    data-testid="stake-task-fact"
    className="flex items-center justify-between gap-3"
  >
    <dt className={cn(v1Typography.supporting, roles.text.supporting)}>
      {label}
    </dt>
    <dd className={cn(v1Typography.label, 'text-right')}>{value}</dd>
  </div>
)
