import type { ReactNode } from 'react'

import { Button, InlineAction } from '@/components/button'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import { v1SemanticRoles as semanticRoles } from '@/components/design-system-v1/semantic-roles'
import {
  transactionAttachedRegionGeometry,
  transactionTaskGeometry,
} from '@/components/design-system-v1/transaction-task-geometry'
import {
  InlineMessage,
  InlineMessageDescription,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'
import { TransactionAmountObject } from '@/components/design-system-v1/transaction-amount-object'
import { v1Typography } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'

import type {
  AutomatedIssuanceChain,
  AutomatedIssuanceOperation,
  AutomatedMintInputFixture,
  AutomatedMintReviewState,
} from './transaction-composition-staged-fixtures'
import {
  formatFixtureAmount,
  inputBalanceFor,
  inputFixtureFromDisplay,
  maxInputFor,
  quoteTokenForChain,
} from './transaction-composition-staged-fixtures'
import { AutomatedIssuanceManualLink } from './transaction-composition-staged-manual-link'
import { TransactionAmountAsset } from './transaction-system-assets'

export const AutomatedMintConfigure = ({
  chain,
  input,
  operation,
  onInputChange,
  onOperationChange,
  setState,
  state,
}: {
  chain: AutomatedIssuanceChain
  input: AutomatedMintInputFixture
  operation: AutomatedIssuanceOperation
  onInputChange: (input: AutomatedMintInputFixture) => void
  onOperationChange: (operation: AutomatedIssuanceOperation) => void
  setState: (state: AutomatedMintReviewState) => void
  state: AutomatedMintReviewState
}) => {
  const setAmount = (display: string) =>
    onInputChange(inputFixtureFromDisplay(display, operation, chain))
  const isMint = operation === 'mint'
  const inputBalance = inputBalanceFor(operation, chain)
  const quoteToken = quoteTokenForChain(chain)
  const isTradingPaused = state === 'Trading paused'

  return (
    <div
      data-testid="automated-mint-configure-surface"
      className="flex min-w-0 w-full flex-1 flex-col"
    >
      <div
        data-testid="automated-mint-configure-frame"
        className={cn(
          'flex flex-1 flex-col',
          transactionAttachedRegionGeometry.frame,
          semanticRoles.surface.recessedContent,
          'max-sm:ring-inset'
        )}
      >
        <div
          data-testid="automated-mint-configure-active"
          className={cn(
            transactionAttachedRegionGeometry.content,
            transactionTaskGeometry.shellInset,
            'flex flex-1 flex-col shadow-sm'
          )}
        >
          <div
            data-testid="automated-mint-configure-header"
            className="flex items-center justify-between gap-2 pb-2"
          >
            <div data-testid="automated-mint-operation-switch">
              <SegmentedControl
                aria-label="Automated issuance operation"
                presentation="contained"
                size="compact"
                width="intrinsic"
                value={operation}
                onValueChange={(value) =>
                  onOperationChange(value as AutomatedIssuanceOperation)
                }
              >
                <SegmentedControlItem
                  data-testid="automated-issuance-operation-mint"
                  value="mint"
                >
                  <>Mint</>
                </SegmentedControlItem>
                <SegmentedControlItem
                  data-testid="automated-issuance-operation-redeem"
                  value="redeem"
                >
                  <>Redeem</>
                </SegmentedControlItem>
              </SegmentedControl>
            </div>
          </div>
          <header
            data-testid="automated-configure-step-content"
            className={cn(
              transactionTaskGeometry.contentInsetWithinShell,
              'mt-auto pb-3 pt-2'
            )}
          >
            <h4 className={v1Typography.itemTitle}>
              {isMint ? (
                chain === ChainId.BSC ? (
                  <>Enter USDT amount</>
                ) : (
                  <>Enter USDC amount</>
                )
              ) : (
                <>Redeem amount</>
              )}
            </h4>
            <p
              className={cn(
                v1Typography.supporting,
                semanticRoles.text.supporting
              )}
            >
              {isMint ? (
                <>
                  Basket assets are acquired automatically before CMC20 is
                  minted.
                </>
              ) : chain === ChainId.BSC ? (
                <>
                  CMC20 is redeemed and its basket assets are automatically sold
                  for USDT.
                </>
              ) : (
                <>
                  CMC20 is redeemed and its basket assets are automatically sold
                  for USDC.
                </>
              )}
            </p>
          </header>
          <TransactionAmountObject
            data-testid="automated-issuance-configure-amount"
            label={isMint ? 'You provide' : 'You redeem'}
            amount={input.display}
            amountPlaceholder="0"
            onAmountChange={setAmount}
            presentation="input"
            asset={
              <TransactionAmountAsset
                chain={chain}
                symbol={isMint ? quoteToken.symbol : 'CMC20'}
              />
            }
            supporting={input.usdDisplay}
            balance={
              <>
                Balance{' '}
                <span className="font-medium text-foreground tabular-nums">
                  {formatFixtureAmount(inputBalance, isMint ? 2 : 6)}
                </span>
              </>
            }
            balanceAction={
              <InlineAction
                onClick={() => onInputChange(maxInputFor(operation, chain))}
              >
                <>Max</>
              </InlineAction>
            }
          />
          {input.exceedsBalance && (
            <p
              data-testid="automated-mint-balance-error"
              className={cn(
                transactionTaskGeometry.contentInsetWithinShell,
                'py-2 text-destructive',
                v1Typography.supporting
              )}
            >
              <>Exceeds available balance</>
            </p>
          )}
          {isTradingPaused && (
            <InlineMessage className="mt-2" tone="warning">
              <InlineMessageTitle>
                <>Trading paused</>
              </InlineMessageTitle>
              <InlineMessageDescription>
                <>
                  WBTC is outside trading hours, so minting and redeeming is
                  unavailable right now.
                </>
              </InlineMessageDescription>
            </InlineMessage>
          )}
          <Button
            data-testid="automated-mint-get-quote"
            className="mt-2 w-full"
            disabled={!input.amount || isTradingPaused}
            onClick={() => setState('Quote searching')}
          >
            {input.amount ? <>Get quote</> : <>Enter amount</>}
          </Button>
          <div className="mt-4 flex flex-col items-start gap-1 px-4 pb-4">
            <p
              className={cn(
                v1Typography.supporting,
                semanticRoles.text.supporting
              )}
            >
              {isMint ? (
                <>Already hold the required basket tokens?</>
              ) : (
                <>Redeem directly to basket assets</>
              )}
            </p>
            <AutomatedIssuanceManualLink chain={chain} operation={operation} />
          </div>
        </div>
        <div
          data-testid="automated-mint-configure-upcoming"
          className={cn(
            'grid content-start gap-4 p-6',
            semanticRoles.surface.recessedContent
          )}
        >
          {isMint ? (
            <>
              <UpcomingStep
                number="2"
                title={<>Automatically acquire assets</>}
                detail={
                  chain === ChainId.BSC ? (
                    <>We use your USDT to get the assets needed for the mint.</>
                  ) : (
                    <>We use your USDC to get the assets needed for the mint.</>
                  )
                }
              />
              <UpcomingStep
                number="3"
                title={<>Mint CMC20</>}
                detail={<>The acquired assets are used to mint your DTF.</>}
              />
            </>
          ) : (
            <UpcomingStep
              number="2"
              title={<>Automatically sell collateral</>}
              detail={
                <>We redeem your CMC20 and sell the collateral for USDC.</>
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}

const StepNumber = ({ number }: { number: string }) => (
  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-xs font-medium text-muted-foreground">
    {number}
  </span>
)

const UpcomingStep = ({
  detail,
  number,
  title,
}: {
  detail: ReactNode
  number: string
  title: ReactNode
}) => (
  <div
    data-testid="automated-configure-step-content"
    className="flex items-center gap-3"
  >
    <StepNumber number={number} />
    <div>
      <p className={v1Typography.label}>{title}</p>
      <p className={cn(v1Typography.supporting, semanticRoles.text.supporting)}>
        {detail}
      </p>
    </div>
  </div>
)
