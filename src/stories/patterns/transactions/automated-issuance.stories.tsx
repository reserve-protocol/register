import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { ChainId } from '@/utils/chains'

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
  title: 'Patterns/Transactions/Automated Issuance',
  component: AutomatedIssuanceStory,
  args: { state: 'Input only ready' },
  argTypes: { state: { control: 'select', options: states } },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Automated mint and redeem states.',
      },
    },
  },
} satisfies Meta<typeof AutomatedIssuanceStory>

export default meta
type Story = StoryObj<typeof meta>

export const QuoteReady: Story = {}
export const OrdersFilling: Story = { args: { state: 'Orders filling' } }
export const RecoverableFailure: Story = {
  args: { state: 'Recoverable failure' },
}
export const RedeemComplete: Story = { args: { state: 'Redeem complete' } }

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
    <div className="bg-secondary p-0 sm:p-6">
      <div
        className={
          narrow
            ? 'mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-[476px] flex-col sm:min-h-0'
            : 'mx-auto flex w-full max-w-[1200px] flex-col'
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
