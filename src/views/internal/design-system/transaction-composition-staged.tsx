import { useState } from 'react'

import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'

import { AutomatedMintConfigure } from './transaction-composition-staged-configure'
import {
  AutomatedMintEntry,
  isAutomatedMintEntryState,
} from './transaction-composition-staged-entry'
import {
  AUTOMATED_MINT_STATE_GROUPS,
  type AutomatedIssuanceChain,
  defaultInputFor,
  emptyInputFor,
  REDEEM_COLLATERAL_ONLY_INPUT,
  type AutomatedIssuanceOperation,
  type AutomatedMintInputFixture,
  type AutomatedMintReviewState,
} from './transaction-composition-staged-fixtures'
import { AutomatedMintWorkspace } from './transaction-composition-staged-workspace'
import { TransactionCompositionFrame } from './transaction-composition-frame'

export const StagedTransactionComposition = () => {
  const [operation, setOperation] = useState<AutomatedIssuanceOperation>('mint')
  const [chain, setChain] = useState<AutomatedIssuanceChain>(ChainId.Base)
  const [state, setState] = useState<AutomatedMintReviewState>('Introduction')
  const [input, setInput] = useState<AutomatedMintInputFixture>(() =>
    emptyInputFor('mint', ChainId.Base)
  )
  const [useExistingCollateral, setUseExistingCollateral] = useState(false)
  const [hasCollateralSwaps, setHasCollateralSwaps] = useState(true)

  const restart = () => {
    setInput(emptyInputFor(operation, chain))
    setUseExistingCollateral(false)
    setHasCollateralSwaps(true)
    setState('Initial configuration')
  }

  const changeOperation = (nextOperation: AutomatedIssuanceOperation) => {
    setOperation(nextOperation)
    setInput(emptyInputFor(nextOperation, chain))
    setUseExistingCollateral(false)
    setHasCollateralSwaps(true)
  }

  const transition = (nextState: AutomatedMintReviewState) => {
    const nextChain =
      nextState === 'BSC configuration'
        ? ChainId.BSC
        : nextState === 'Introduction' ||
            nextState === 'Initial configuration' ||
            nextState === 'Trading paused'
          ? ChainId.Base
          : chain
    if (nextChain !== chain) setChain(nextChain)
    const isCollateralOnly = nextState === 'Existing collateral only'
    const nextOperation =
      nextState === 'Redeem complete' || isCollateralOnly
        ? 'redeem'
        : nextState === 'Mint complete' ||
            nextState === 'Collateral ready' ||
            nextState === 'Final mint signing'
          ? 'mint'
          : operation
    if (isCollateralOnly) {
      setOperation('redeem')
      setInput(REDEEM_COLLATERAL_ONLY_INPUT)
      setUseExistingCollateral(true)
    } else if (nextOperation !== operation) {
      setOperation(nextOperation)
      setInput(defaultInputFor(nextOperation, nextChain))
      setUseExistingCollateral(false)
    }
    if (nextState === 'Input only ready') setUseExistingCollateral(false)
    if (nextState === 'No swaps needed') setHasCollateralSwaps(false)
    if (nextState === 'Redeem complete') setHasCollateralSwaps(true)
    if (
      nextState === 'Input only ready' ||
      nextState === 'Existing collateral ready' ||
      nextState === 'Existing collateral only' ||
      nextState === 'Price unavailable' ||
      nextState === 'Per-order quote failure' ||
      nextState === 'Split order quotes' ||
      nextState === 'Authorizing orders' ||
      nextState === 'Orders filling' ||
      nextState === 'Recoverable failure' ||
      nextState === 'Cancelled order' ||
      nextState === 'Wallet unavailable' ||
      nextState === 'Transaction failed'
    ) {
      setHasCollateralSwaps(true)
    }
    if (
      nextState === 'Existing collateral ready' ||
      nextState === 'Existing collateral only'
    ) {
      setUseExistingCollateral(true)
    }
    if (nextState === 'Initial configuration') {
      setUseExistingCollateral(false)
      setHasCollateralSwaps(true)
      if (input.amount?.value === 0n) {
        setInput(emptyInputFor(nextOperation, nextChain))
      }
    }
    const isEntryState = isAutomatedMintEntryState(nextState)
    if (isEntryState || nextState === 'Trading paused') {
      setHasCollateralSwaps(true)
    }
    if (nextState === 'Introduction') {
      setInput(emptyInputFor(nextOperation, nextChain))
    }
    if (nextState === 'BSC configuration') {
      setOperation('mint')
      setInput(emptyInputFor('mint', ChainId.BSC))
      setUseExistingCollateral(false)
      setHasCollateralSwaps(true)
    }
    if (
      !isEntryState &&
      nextState !== 'Initial configuration' &&
      nextState !== 'BSC configuration' &&
      nextState !== 'Existing collateral only' &&
      (!input.amount ||
        (input.amount.value === 0n && nextState === 'Input only ready'))
    ) {
      setInput(defaultInputFor(nextOperation, nextChain))
    }
    setState(nextState)
  }
  const isEntryState = isAutomatedMintEntryState(state)
  const isNarrowState =
    isEntryState ||
    state === 'Initial configuration' ||
    state === 'Trading paused' ||
    state === 'BSC configuration'

  return (
    <TransactionCompositionFrame<AutomatedMintReviewState>
      id="staged"
      state={state}
      onStateChange={transition}
      stateGroups={AUTOMATED_MINT_STATE_GROUPS}
      stageInset={isNarrowState ? 'mobile-flush' : 'flush'}
      model="Transparent staged · production-backed automated issuance"
      title="Automated mint / redeem workspace"
      description="A narrow amount-entry task widens after quote creation into an inspectable order workspace. Mint and Redeem share one structure while preserving their different assets, order direction, action boundaries, and completion evidence."
      parts={[
        {
          label: 'Amount, identity, status, and action seams',
          status: 'Proposed candidate',
        },
        {
          label: 'Progressive page shell and CoW order rows',
          status: 'Flow-owned',
        },
        {
          label: 'Existing-collateral and result presentation',
          status: 'Flow-owned',
        },
        { label: 'SDK execution and retry policy', status: 'Retained current' },
      ]}
    >
      {() => (
        <div
          data-testid="automated-mint-narrow-stage"
          className={cn(
            'mx-auto flex w-full flex-col transition-[max-width] duration-500 ease-out motion-reduce:transition-none',
            isNarrowState
              ? 'min-h-[calc(100dvh-3.5rem)] sm:min-h-0 sm:max-w-[476px]'
              : 'max-w-[1200px]'
          )}
        >
          {isEntryState ? (
            <AutomatedMintEntry state={state} setState={transition} />
          ) : state === 'Initial configuration' ||
            state === 'Trading paused' ||
            state === 'BSC configuration' ? (
            <AutomatedMintConfigure
              chain={chain}
              input={input}
              operation={operation}
              onInputChange={setInput}
              onOperationChange={changeOperation}
              setState={transition}
              state={state}
            />
          ) : (
            <AutomatedMintWorkspace
              chain={chain}
              onRestart={restart}
              hasCollateralSwaps={hasCollateralSwaps}
              input={input.amount ? input : defaultInputFor(operation, chain)}
              onUseExistingCollateralChange={setUseExistingCollateral}
              operation={operation}
              setState={transition}
              state={state}
              useExistingCollateral={useExistingCollateral}
            />
          )}
        </div>
      )}
    </TransactionCompositionFrame>
  )
}
