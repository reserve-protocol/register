import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Trans, useLingui } from '@lingui/react/macro'

import { Button } from '@/components/button'
import { Link } from '@/components/design-system-v1/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/design-system-v1/select'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'

import DocumentationSpecimenCanvas from './documentation-specimen-canvas'
import {
  AUTOMATED_FAMILY,
  MANUAL_FAMILY,
  STAKE_FAMILY,
  TRANSACTION_FAMILIES,
  VOTE_LOCK_FAMILY,
  ZAPPER_FAMILY,
  type TransactionFamilyDefinition,
  type TransactionFlowNode,
} from './documentation-transactions/model'
import {
  TRANSACTION_DOCUMENTATION_SECTION_IDS,
  TRANSACTION_DOCUMENTATION_SECTIONS,
} from './documentation-transactions/navigation'
import { ManualIssuanceAnchor } from './transaction-composition-manual-anchor'
import type { ManualReviewState } from './transaction-composition-manual-scenarios'
import { ZapperInlineReference } from './transaction-composition-rfq'
import type { ZapperReviewState } from './transaction-composition-rfq'
import { StakeProductContext } from './transaction-composition-stake'
import type { StakeReviewState } from './transaction-composition-stake-support'
import { AutomatedMintConfigure } from './transaction-composition-staged-configure'
import {
  AutomatedMintEntry,
  isAutomatedMintEntryState,
} from './transaction-composition-staged-entry'
import {
  REDEEM_COLLATERAL_ONLY_INPUT,
  defaultInputFor,
  emptyInputFor,
  type AutomatedIssuanceChain,
  type AutomatedIssuanceOperation,
  type AutomatedMintInputFixture,
  type AutomatedMintReviewState,
} from './transaction-composition-staged-fixtures'
import { AutomatedMintWorkspace } from './transaction-composition-staged-workspace'
import { VoteLockProductContext } from './transaction-composition-vote-lock'
import type { VoteLockReviewState } from './transaction-composition-vote-lock-support'
import type { DocumentationSpecimenFallback } from './use-documentation-specimen-state'

export {
  TRANSACTION_DOCUMENTATION_SECTION_IDS,
  TRANSACTION_DOCUMENTATION_SECTIONS,
}

type FamilySelection = {
  node: TransactionFlowNode
  index: number
  view: 'current' | 'all'
  fallbacks: DocumentationSpecimenFallback[]
}

type FamilyStageProps = {
  automatedState: AutomatedWorkbenchState
  manualRemembered: {
    amount: string
    unlimited: boolean
  }
  node: TransactionFlowNode
  onAutomatedRestart: () => void
  onAutomatedInputChange: (input: AutomatedMintInputFixture) => void
  onAutomatedUseExistingCollateralChange: (value: boolean) => void
  onManualRememberedChange: (amount: string, unlimited: boolean) => void
  onStateChange: (state: string) => void
  onOperationChange: (operation: string) => void
}

type AutomatedWorkbenchState = {
  chain: AutomatedIssuanceChain
  hasCollateralSwaps: boolean
  input: AutomatedMintInputFixture
  operation: AutomatedIssuanceOperation
  useExistingCollateral: boolean
}

const MANUAL_DEFAULT: { amount: string; unlimited: boolean } = {
  amount: '100',
  unlimited: true,
}

const uniqueBy = <Value,>(
  values: readonly Value[],
  key: (value: Value) => string
) => Array.from(new Map(values.map((value) => [key(value), value])).values())

const familyKey = (family: TransactionFamilyDefinition, dimension: string) =>
  `${family.id}.${dimension}`

const defaultNodeFor = (family: TransactionFamilyDefinition) =>
  family.nodes.find(({ state }) => state === family.defaultState) ??
  family.nodes[0]!

export const resolveTransactionFamilySelection = (
  family: TransactionFamilyDefinition,
  search: string
): FamilySelection => {
  const params = new URLSearchParams(search)
  const fallbackNode = defaultNodeFor(family)
  const fallbacks: DocumentationSpecimenFallback[] = []
  const requestedOperation = params.get(familyKey(family, 'operation'))
  const requestedStep = params.get(familyKey(family, 'step'))
  const requestedState = params.get(familyKey(family, 'state'))
  const requestedView = params.get(familyKey(family, 'view'))
  const operations = uniqueBy(family.nodes, ({ operation }) => operation)
  const validOperation = operations.find(
    ({ operation }) => operation === requestedOperation
  )?.operation

  if (requestedOperation && !validOperation) {
    fallbacks.push({
      dimension: 'operation',
      requestedValue: requestedOperation,
      fallbackValue: fallbackNode.operation,
    })
  }

  const operation = validOperation ?? fallbackNode.operation
  const operationNodes = family.nodes.filter(
    (node) => node.operation === operation
  )
  const defaultOperationNode =
    operationNodes.find(({ state }) => state === family.defaultState) ??
    operationNodes[0]!
  const validStep = operationNodes.find(
    ({ step }) => step === requestedStep
  )?.step

  if (requestedStep && !validStep) {
    fallbacks.push({
      dimension: 'step',
      requestedValue: requestedStep,
      fallbackValue: defaultOperationNode.step,
    })
  }

  const step = validStep ?? defaultOperationNode.step
  const stepNodes = operationNodes.filter((node) => node.step === step)
  const fallbackStateNode = validStep ? stepNodes[0]! : defaultOperationNode
  const matchingState = stepNodes.find(
    ({ stateSlug }) => stateSlug === requestedState
  )

  if (requestedState && !matchingState) {
    fallbacks.push({
      dimension: 'state',
      requestedValue: requestedState,
      fallbackValue: fallbackStateNode.stateSlug,
    })
  }

  if (requestedView && requestedView !== 'all') {
    fallbacks.push({
      dimension: 'view',
      requestedValue: requestedView,
      fallbackValue: 'current',
    })
  }

  const node = matchingState ?? fallbackStateNode
  return {
    node,
    index: family.nodes.indexOf(node),
    view: requestedView === 'all' ? 'all' : 'current',
    fallbacks,
  }
}

const withFamilyNode = (
  family: TransactionFamilyDefinition,
  search: string,
  node: TransactionFlowNode
) => {
  const params = new URLSearchParams(search)
  params.set(familyKey(family, 'operation'), node.operation)
  params.set(familyKey(family, 'step'), node.step)
  params.set(familyKey(family, 'state'), node.stateSlug)
  return params.toString() ? `?${params.toString()}` : ''
}

const resetFamilySearch = (
  family: TransactionFamilyDefinition,
  search: string
) => {
  const params = new URLSearchParams(search)
  const prefix = `${family.id}.`
  Array.from(params.keys()).forEach((key) => {
    if (key.startsWith(prefix)) params.delete(key)
  })
  return params.toString() ? `?${params.toString()}` : ''
}

const SelectControl = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly { value: string; label: string }[]
  onChange: (value: string) => void
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger size="compact" className="w-56" aria-label={label}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

const OperationControl = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly { value: string; label: string }[]
  onChange: (value: string) => void
}) => (
  <SegmentedControl
    aria-label={label}
    presentation="text-only"
    textOnlyDensity="compact"
    value={value}
    onValueChange={onChange}
  >
    {options.map((option) => (
      <SegmentedControlItem key={option.value} value={option.value}>
        {option.label}
      </SegmentedControlItem>
    ))}
  </SegmentedControl>
)

const AutomatedOwnerStage = ({
  automatedState,
  node,
  onAutomatedRestart,
  onAutomatedInputChange,
  onAutomatedUseExistingCollateralChange,
  onStateChange,
  onOperationChange,
}: FamilyStageProps) => {
  const state = node.state as AutomatedMintReviewState
  const { chain, hasCollateralSwaps, input, operation, useExistingCollateral } =
    automatedState
  const isEntry = isAutomatedMintEntryState(state)
  const isConfiguration =
    state === 'Initial configuration' ||
    state === 'Trading paused' ||
    state === 'BSC configuration'
  if (isEntry) {
    return (
      <div className="mx-auto min-h-[32rem] w-full max-w-[476px]">
        <AutomatedMintEntry
          state={state}
          setState={(next) => onStateChange(next)}
        />
      </div>
    )
  }

  if (isConfiguration) {
    return (
      <div className="mx-auto min-h-[32rem] w-full max-w-[476px]">
        <AutomatedMintConfigure
          chain={chain}
          input={input}
          operation={operation}
          onInputChange={onAutomatedInputChange}
          onOperationChange={
            onOperationChange as (operation: AutomatedIssuanceOperation) => void
          }
          setState={(next) => onStateChange(next)}
          state={state}
        />
      </div>
    )
  }

  return (
    <AutomatedMintWorkspace
      chain={chain}
      onRestart={onAutomatedRestart}
      hasCollateralSwaps={hasCollateralSwaps}
      input={input}
      onUseExistingCollateralChange={onAutomatedUseExistingCollateralChange}
      operation={operation}
      setState={(next) => onStateChange(next)}
      state={state}
      useExistingCollateral={useExistingCollateral}
    />
  )
}

const StakeOwnerStage = ({ node, onStateChange }: FamilyStageProps) => (
  <StakeProductContext
    launcherOnly
    state={node.state as StakeReviewState}
    setState={onStateChange as (state: StakeReviewState) => void}
  />
)

const ManualOwnerStage = ({
  manualRemembered,
  node,
  onManualRememberedChange,
}: FamilyStageProps) => (
  <ManualIssuanceAnchor
    key={node.state}
    state={node.state as ManualReviewState}
    amount={manualRemembered.amount}
    unlimited={manualRemembered.unlimited}
    remember={onManualRememberedChange}
    showPreviewNote={false}
  />
)

const AUTOMATED_SWAP_STATES: readonly AutomatedMintReviewState[] = [
  'Input only ready',
  'Existing collateral ready',
  'Existing collateral only',
  'Price unavailable',
  'Per-order quote failure',
  'Split order quotes',
  'Authorizing orders',
  'Orders filling',
  'Recoverable failure',
  'Cancelled order',
  'Wallet unavailable',
  'Transaction failed',
]

const transitionAutomatedState = (
  current: AutomatedWorkbenchState,
  state: AutomatedMintReviewState
): AutomatedWorkbenchState => {
  let { chain, hasCollateralSwaps, input, operation, useExistingCollateral } =
    current
  chain =
    state === 'BSC configuration'
      ? ChainId.BSC
      : state === 'Introduction' ||
          state === 'Initial configuration' ||
          state === 'Trading paused'
        ? ChainId.Base
        : chain
  const isCollateralOnly = state === 'Existing collateral only'
  const nextOperation =
    state === 'Redeem complete' || isCollateralOnly
      ? 'redeem'
      : state === 'Mint complete' ||
          state === 'Collateral ready' ||
          state === 'Final mint signing'
        ? 'mint'
        : operation

  if (isCollateralOnly) {
    operation = 'redeem'
    input = REDEEM_COLLATERAL_ONLY_INPUT
    useExistingCollateral = true
  } else if (nextOperation !== operation) {
    operation = nextOperation
    input = defaultInputFor(nextOperation, chain)
    useExistingCollateral = false
  }
  if (state === 'Input only ready') useExistingCollateral = false
  if (state === 'No swaps needed') hasCollateralSwaps = false
  if (state === 'Redeem complete') hasCollateralSwaps = true
  if (AUTOMATED_SWAP_STATES.includes(state)) hasCollateralSwaps = true
  if (
    state === 'Existing collateral ready' ||
    state === 'Existing collateral only'
  ) {
    useExistingCollateral = true
  }
  if (state === 'Initial configuration') {
    useExistingCollateral = false
    hasCollateralSwaps = true
    if (input.amount?.value === 0n) input = emptyInputFor(operation, chain)
  }
  const isEntry = isAutomatedMintEntryState(state)
  if (isEntry || state === 'Trading paused') hasCollateralSwaps = true
  if (state === 'Introduction') input = emptyInputFor(operation, chain)
  if (state === 'BSC configuration') {
    operation = 'mint'
    input = emptyInputFor('mint', ChainId.BSC)
    useExistingCollateral = false
    hasCollateralSwaps = true
  }
  if (
    !isEntry &&
    state !== 'Initial configuration' &&
    state !== 'BSC configuration' &&
    state !== 'Existing collateral only' &&
    (!input.amount ||
      (input.amount.value === 0n && state === 'Input only ready'))
  ) {
    input = defaultInputFor(operation, chain)
  }

  return {
    chain,
    hasCollateralSwaps,
    input,
    operation,
    useExistingCollateral,
  }
}

const initialAutomatedStateFor = (
  node: TransactionFlowNode
): AutomatedWorkbenchState => {
  const operation = node.operation as AutomatedIssuanceOperation
  return transitionAutomatedState(
    {
      chain: ChainId.Base,
      hasCollateralSwaps: true,
      input: emptyInputFor(operation, ChainId.Base),
      operation,
      useExistingCollateral: false,
    },
    node.state as AutomatedMintReviewState
  )
}

const isDefaultAutomatedState = (state: AutomatedWorkbenchState) => {
  const expected = initialAutomatedStateFor(defaultNodeFor(AUTOMATED_FAMILY))
  const amount = state.input.amount
  const expectedAmount = expected.input.amount

  return (
    state.chain === expected.chain &&
    state.hasCollateralSwaps === expected.hasCollateralSwaps &&
    state.operation === expected.operation &&
    state.useExistingCollateral === expected.useExistingCollateral &&
    state.input.display === expected.input.display &&
    state.input.exceedsBalance === expected.input.exceedsBalance &&
    state.input.usdDisplay === expected.input.usdDisplay &&
    amount?.decimals === expectedAmount?.decimals &&
    amount?.symbol === expectedAmount?.symbol &&
    amount?.value === expectedAmount?.value
  )
}

const changeAutomatedOperation = (
  current: AutomatedWorkbenchState,
  operation: AutomatedIssuanceOperation
): AutomatedWorkbenchState => ({
  ...current,
  hasCollateralSwaps: true,
  input: emptyInputFor(operation, current.chain),
  operation,
  useExistingCollateral: false,
})

const stageFor = (
  family: TransactionFamilyDefinition,
  props: FamilyStageProps
) => {
  if (family === ZAPPER_FAMILY)
    return (
      <ZapperInlineReference state={props.node.state as ZapperReviewState} />
    )
  if (family === AUTOMATED_FAMILY) return <AutomatedOwnerStage {...props} />
  if (family === STAKE_FAMILY) return <StakeOwnerStage {...props} />
  if (family === VOTE_LOCK_FAMILY)
    return (
      <VoteLockProductContext
        launcherOnly
        state={props.node.state as VoteLockReviewState}
        setState={props.onStateChange as (state: VoteLockReviewState) => void}
      />
    )
  if (family === MANUAL_FAMILY) return <ManualOwnerStage {...props} />
  return null
}

const TransactionFamilySection = ({
  family,
}: {
  family: TransactionFamilyDefinition
}) => {
  const { t } = useLingui()
  const location = useLocation()
  const navigate = useNavigate()
  const selection = useMemo(
    () => resolveTransactionFamilySelection(family, location.search),
    [family, location.search]
  )
  const [automatedState, setAutomatedState] = useState<AutomatedWorkbenchState>(
    () =>
      initialAutomatedStateFor(
        family === AUTOMATED_FAMILY
          ? selection.node
          : defaultNodeFor(AUTOMATED_FAMILY)
      )
  )
  const [manualRemembered, setManualRemembered] = useState({
    ...MANUAL_DEFAULT,
  })
  const [resetRevision, setResetRevision] = useState(0)
  const operationOptions = uniqueBy(
    family.nodes,
    ({ operation }) => operation
  ).map(({ operation, operationLabel }) => ({
    value: operation,
    label: t(operationLabel),
  }))
  const operationNodes = family.nodes.filter(
    ({ operation }) => operation === selection.node.operation
  )
  const stepOptions = uniqueBy(operationNodes, ({ step }) => step).map(
    ({ step, stepLabel }) => ({ value: step, label: t(stepLabel) })
  )
  const stateOptions = operationNodes
    .filter(({ step }) => step === selection.node.step)
    .map(({ stateSlug, stateLabel }) => ({
      value: stateSlug,
      label: t(stateLabel),
    }))
  const operationIndex = operationNodes.indexOf(selection.node)
  const previous = operationNodes[operationIndex - 1]
  const next = operationNodes[operationIndex + 1]

  const navigateToNodeLocation = (node: TransactionFlowNode) =>
    navigate(
      {
        pathname: location.pathname,
        search: withFamilyNode(family, location.search, node),
        hash: `#${family.id}`,
      },
      { replace: true, preventScrollReset: true }
    )

  const nodeForAutomatedState = (
    state: AutomatedMintReviewState,
    operation: AutomatedIssuanceOperation
  ) =>
    AUTOMATED_FAMILY.nodes.find(
      (node) => node.operation === operation && node.state === state
    )

  const navigateToNode = (node: TransactionFlowNode) => {
    if (family !== AUTOMATED_FAMILY) {
      navigateToNodeLocation(node)
      return
    }
    const nextState = transitionAutomatedState(
      automatedState,
      node.state as AutomatedMintReviewState
    )
    const resolvedNode =
      nodeForAutomatedState(
        node.state as AutomatedMintReviewState,
        nextState.operation
      ) ?? node
    setAutomatedState(nextState)
    navigateToNodeLocation(resolvedNode)
  }

  const navigateToFirst = (
    predicate: (node: TransactionFlowNode) => boolean
  ) => {
    const node = family.nodes.find(predicate)
    if (node) navigateToNode(node)
  }

  const navigateToOperation = (operation: string) => {
    if (family !== AUTOMATED_FAMILY) {
      const node = family.nodes.find(
        (candidate) => candidate.operation === operation
      )
      if (node) navigateToNodeLocation(node)
      return
    }
    const nextOperation = operation as AutomatedIssuanceOperation
    const operationState = changeAutomatedOperation(
      automatedState,
      nextOperation
    )
    const node =
      nodeForAutomatedState(
        selection.node.state as AutomatedMintReviewState,
        nextOperation
      ) ??
      AUTOMATED_FAMILY.nodes.find(
        (candidate) => candidate.operation === nextOperation
      )
    if (!node) return
    const nextState = transitionAutomatedState(
      operationState,
      node.state as AutomatedMintReviewState
    )
    const resolvedNode =
      nodeForAutomatedState(
        node.state as AutomatedMintReviewState,
        nextState.operation
      ) ?? node
    setAutomatedState(nextState)
    navigateToNodeLocation(resolvedNode)
  }

  const navigateToState = (state: string) => {
    if (family !== AUTOMATED_FAMILY) {
      navigateToFirst(
        (node) =>
          node.operation === selection.node.operation && node.state === state
      )
      return
    }
    const nextState = transitionAutomatedState(
      automatedState,
      state as AutomatedMintReviewState
    )
    const node = nodeForAutomatedState(
      state as AutomatedMintReviewState,
      nextState.operation
    )
    if (!node) return
    setAutomatedState(nextState)
    navigateToNodeLocation(node)
  }

  const restartAutomated = () => {
    const nextState: AutomatedWorkbenchState = {
      ...automatedState,
      hasCollateralSwaps: true,
      input: emptyInputFor(automatedState.operation, automatedState.chain),
      useExistingCollateral: false,
    }
    const node = nodeForAutomatedState(
      'Initial configuration',
      nextState.operation
    )
    if (!node) return
    setAutomatedState(nextState)
    navigateToNodeLocation(node)
  }

  const resetFamily = () => {
    const defaultNode = defaultNodeFor(family)
    if (family === AUTOMATED_FAMILY) {
      setAutomatedState(initialAutomatedStateFor(defaultNode))
    }
    if (family === MANUAL_FAMILY) {
      setManualRemembered({ ...MANUAL_DEFAULT })
    }
    setResetRevision((current) => current + 1)
    navigate(
      {
        pathname: location.pathname,
        search: resetFamilySearch(family, location.search),
        hash: `#${family.id}`,
      },
      { replace: true, preventScrollReset: true }
    )
  }

  const stateHref = (node: TransactionFlowNode) =>
    `${location.pathname}${withFamilyNode(family, location.search, node)}#${family.id}`
  const isLocalStateDefault =
    family === AUTOMATED_FAMILY
      ? isDefaultAutomatedState(automatedState)
      : family === MANUAL_FAMILY
        ? manualRemembered.amount === MANUAL_DEFAULT.amount &&
          manualRemembered.unlimited === MANUAL_DEFAULT.unlimited
        : true
  const isDefault =
    selection.node === defaultNodeFor(family) &&
    selection.view === 'current' &&
    isLocalStateDefault
  const familyTitle = t(family.title)
  const isModalFamily = family === STAKE_FAMILY || family === VOTE_LOCK_FAMILY
  const automatedStateName = selection.node.state as AutomatedMintReviewState
  const isAutomatedEntry =
    family === AUTOMATED_FAMILY && isAutomatedMintEntryState(automatedStateName)
  const isAutomatedConfiguration =
    family === AUTOMATED_FAMILY &&
    (automatedStateName === 'Initial configuration' ||
      automatedStateName === 'Trading paused' ||
      automatedStateName === 'BSC configuration')
  const isFullCanvas =
    family === MANUAL_FAMILY ||
    (family === AUTOMATED_FAMILY &&
      !isAutomatedEntry &&
      !isAutomatedConfiguration)
  const isCentered = !isFullCanvas
  return (
    <section
      id={family.id}
      data-testid="transaction-documentation-family"
      className="scroll-mt-24 space-y-4"
    >
      <div className="space-y-1">
        <h3 className={type.sectionTitle}>{familyTitle}</h3>
        <p className={cn(type.supporting, 'max-w-3xl text-muted-foreground')}>
          {t(family.description)}
        </p>
      </div>

      <DocumentationSpecimenCanvas
        host={{
          name: t`${familyTitle} example`,
          backdropOwner: isCentered
            ? t`Documentation beige canvas`
            : t`Documentation neutral canvas`,
          insetOwner: isFullCanvas ? t`Flow workspace` : t`Contained example`,
        }}
        controls={{
          operation: (
            <OperationControl
              label={t`${familyTitle} operation`}
              value={selection.node.operation}
              options={operationOptions}
              onChange={navigateToOperation}
            />
          ),
          step: (
            <SelectControl
              label={t`${familyTitle} step`}
              value={selection.node.step}
              options={stepOptions}
              onChange={(step) =>
                navigateToFirst(
                  (node) =>
                    node.operation === selection.node.operation &&
                    node.step === step
                )
              }
            />
          ),
          state: (
            <SelectControl
              label={t`${familyTitle} state`}
              value={selection.node.stateSlug}
              options={stateOptions}
              onChange={(stateSlug) =>
                navigateToFirst(
                  (node) =>
                    node.operation === selection.node.operation &&
                    node.step === selection.node.step &&
                    node.stateSlug === stateSlug
                )
              }
            />
          ),
        }}
        reset={
          <Button
            disabled={isDefault}
            size="compact"
            tone="quiet"
            onClick={resetFamily}
          >
            <Trans>Reset family</Trans>
          </Button>
        }
        fallbacks={selection.fallbacks}
        provenance={
          <p>
            <Trans>
              Paused exploratory checkpoint · Owner: {family.owner}.
              Deterministic fixtures demonstrate reviewed states; they do not
              execute product transactions.
            </Trans>
          </p>
        }
        mode={isFullCanvas ? 'full-canvas' : 'intrinsic'}
        backdrop={isCentered ? 'beige' : 'neutral'}
        padding={isFullCanvas ? 'none' : 'contained'}
        align={isCentered ? 'center' : 'start'}
        stableHeight="standard"
        hostClassName={isModalFamily ? 'max-sm:-mx-4' : undefined}
        specimenClassName={cn(
          'h-[34rem] overflow-auto lg:h-[38rem]',
          isModalFamily && 'max-sm:p-4'
        )}
      >
        <div
          key={`${selection.node.operation}-${selection.node.stateSlug}-${resetRevision}`}
          className={cn(
            'min-w-0',
            isFullCanvas ? 'w-full' : 'w-full max-w-full'
          )}
          data-transaction-launcher-treatment={
            isModalFamily ? 'neutral-action' : undefined
          }
          data-testid="transaction-current-specimen"
        >
          {stageFor(family, {
            automatedState,
            manualRemembered,
            node: selection.node,
            onAutomatedRestart: restartAutomated,
            onAutomatedInputChange: (input) =>
              setAutomatedState((current) => ({ ...current, input })),
            onAutomatedUseExistingCollateralChange: (value) =>
              setAutomatedState((current) => ({
                ...current,
                useExistingCollateral: value,
              })),
            onManualRememberedChange: (amount, unlimited) =>
              setManualRemembered({ amount, unlimited }),
            onStateChange: navigateToState,
            onOperationChange: navigateToOperation,
          })}
        </div>
      </DocumentationSpecimenCanvas>

      <nav
        aria-label={t`${familyTitle} state sequence`}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <p className="text-xs text-muted-foreground">
          <Trans>
            {operationIndex + 1} of {operationNodes.length}
          </Trans>{' '}
          · {t(selection.node.stateLabel)}
        </p>
        <div
          className="flex items-center gap-2"
          data-testid="transaction-sequence-controls"
        >
          <Button
            className="min-h-11"
            disabled={!previous}
            size="compact"
            tone="secondary"
            onClick={() => previous && navigateToNode(previous)}
          >
            <Trans>Previous</Trans>
          </Button>
          <Button
            className="min-h-11"
            disabled={!next}
            size="compact"
            tone="secondary"
            onClick={() => next && navigateToNode(next)}
          >
            <Trans>Next</Trans>
          </Button>
        </div>
      </nav>

      {selection.view === 'all' ? (
        <div
          className="border-t border-border pt-4"
          data-testid="transaction-audit-index"
        >
          <p className={type.label}>
            <Trans>Audit view · ordered states</Trans>
          </p>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {family.nodes.map((node, index) => (
              <li key={`${node.operation}-${node.step}-${node.stateSlug}`}>
                <Link
                  aria-current={index === selection.index ? 'step' : undefined}
                  href={stateHref(node)}
                  treatment="standalone"
                >
                  {index + 1}. {t(node.operationLabel)} · {t(node.stepLabel)} ·{' '}
                  {t(node.stateLabel)}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  )
}

export const DocumentationTransactionWorkbench = () => {
  const { t } = useLingui()

  return (
    <section
      id="transaction-workbench"
      aria-label={t`Transaction systems`}
      className="scroll-mt-24 space-y-12"
    >
      <p className={cn(type.supporting, 'max-w-3xl text-muted-foreground')}>
        <Trans>
          These checkpoint compositions remain under review. Each family keeps
          its own operation, step, state order, and owner; this explorer is not
          a canonical product workflow or a universal transaction controller.
        </Trans>
      </p>

      {TRANSACTION_FAMILIES.map((family) => (
        <TransactionFamilySection key={family.id} family={family} />
      ))}
    </section>
  )
}

export default DocumentationTransactionWorkbench
