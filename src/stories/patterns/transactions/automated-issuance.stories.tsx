import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { ChainId } from '@/utils/chains'

import { StorySurface } from '../../shared/story-surface'
import { TransactionDocs } from './transaction-docs'
import { AutomatedMintConfigure } from './reference/transaction-composition-staged-configure'
import {
  AutomatedMintEntry,
  isAutomatedMintEntryState,
} from './reference/transaction-composition-staged-entry'
import {
  AUTOMATED_MINT_STATE_GROUPS,
  REDEEM_COLLATERAL_ONLY_INPUT,
  defaultInputFor,
  emptyInputFor,
  type AutomatedIssuanceChain,
  type AutomatedIssuanceOperation,
  type AutomatedMintInputFixture,
  type AutomatedMintReviewState,
} from './reference/transaction-composition-staged-fixtures'
import { AutomatedMintWorkspace } from './reference/transaction-composition-staged-workspace'

const states = AUTOMATED_MINT_STATE_GROUPS.flatMap((group) => group.states)

const meta = {
  title: 'Patterns/Transactions (In progress)/Automated issuance',
  tags: ['in-progress'],
  component: AutomatedIssuanceStory,
  decorators: [
    (Story, context) => (
      <StorySurface fullHeight={context.viewMode !== 'docs'}>
        <Story />
      </StorySurface>
    ),
  ],
  args: { state: 'Input only ready' },
  argTypes: { state: { control: 'select', options: states } },
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: () => <TransactionDocs interactive={QuoteReady} />,
      description: {
        component: 'Automated mint and redeem states.',
      },
    },
  },
} satisfies Meta<typeof AutomatedIssuanceStory>

export default meta
type Story = StoryObj<typeof meta>

export const QuoteReady: Story = { name: 'Quote ready' }
export const OrdersFilling: Story = {
  name: 'Orders filling',
  args: { state: 'Orders filling' },
}
export const RecoverableFailure: Story = {
  name: 'Recoverable failure',
  args: { state: 'Recoverable failure' },
}
export const RedeemComplete: Story = {
  name: 'Redeem complete',
  args: { state: 'Redeem complete' },
}

function AutomatedIssuanceStory({
  state = 'Input only ready',
}: {
  state: AutomatedMintReviewState
}) {
  return <AutomatedState key={state} initialState={state} />
}

function AutomatedState({
  initialState,
}: {
  initialState: AutomatedMintReviewState
}) {
  const initialChain: AutomatedIssuanceChain =
    initialState === 'BSC configuration' ? ChainId.BSC : ChainId.Base
  const initialOperation: AutomatedIssuanceOperation =
    initialState === 'Redeem complete' ||
    initialState === 'Existing collateral only'
      ? 'redeem'
      : 'mint'
  const initialInput =
    initialState === 'Existing collateral only'
      ? REDEEM_COLLATERAL_ONLY_INPUT
      : isAutomatedMintEntryState(initialState) ||
          initialState === 'Initial configuration' ||
          initialState === 'Trading paused' ||
          initialState === 'BSC configuration'
        ? emptyInputFor(initialOperation, initialChain)
        : defaultInputFor(initialOperation, initialChain)
  const [chain] = useState(initialChain)
  const [operation, setOperation] = useState(initialOperation)
  const [input, setInput] = useState<AutomatedMintInputFixture>(initialInput)
  const [useExistingCollateral, setUseExistingCollateral] = useState(
    initialState === 'Existing collateral ready' ||
      initialState === 'Existing collateral only'
  )
  const hasCollateralSwaps = initialState !== 'No swaps needed'

  const changeOperation = (nextOperation: AutomatedIssuanceOperation) => {
    setOperation(nextOperation)
    setInput(emptyInputFor(nextOperation, chain))
    setUseExistingCollateral(false)
  }
  const preserveSelectedState = () => {}
  const narrow =
    isAutomatedMintEntryState(initialState) ||
    initialState === 'Initial configuration' ||
    initialState === 'Trading paused' ||
    initialState === 'BSC configuration'

  return (
    <div>
      <div
        className={
          narrow
            ? 'mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-[476px] flex-col sm:min-h-0'
            : 'mx-auto flex w-full flex-col'
        }
      >
        {isAutomatedMintEntryState(initialState) ? (
          <AutomatedMintEntry
            state={initialState}
            setState={preserveSelectedState}
          />
        ) : initialState === 'Initial configuration' ||
          initialState === 'Trading paused' ||
          initialState === 'BSC configuration' ? (
          <AutomatedMintConfigure
            chain={chain}
            input={input}
            onInputChange={setInput}
            onOperationChange={changeOperation}
            operation={operation}
            setState={preserveSelectedState}
            state={initialState}
          />
        ) : (
          <AutomatedMintWorkspace
            chain={chain}
            hasCollateralSwaps={hasCollateralSwaps}
            input={input.amount ? input : defaultInputFor(operation, chain)}
            onRestart={preserveSelectedState}
            onUseExistingCollateralChange={setUseExistingCollateral}
            operation={operation}
            setState={preserveSelectedState}
            state={initialState}
            useExistingCollateral={useExistingCollateral}
          />
        )}
      </div>
    </div>
  )
}
