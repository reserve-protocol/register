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
  node: TransactionFlowNode
  onStateChange: (state: string) => void
  onOperationChange: (operation: string) => void
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
  const matchingState = stepNodes.find(
    ({ stateSlug }) => stateSlug === requestedState
  )

  if (requestedState && !matchingState) {
    fallbacks.push({
      dimension: 'state',
      requestedValue: requestedState,
      fallbackValue: stepNodes[0]!.stateSlug,
    })
  }

  if (requestedView && requestedView !== 'all') {
    fallbacks.push({
      dimension: 'view',
      requestedValue: requestedView,
      fallbackValue: 'current',
    })
  }

  const node = matchingState ?? stepNodes[0]!
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

const AutomatedOwnerStage = ({
  node,
  onStateChange,
  onOperationChange,
}: FamilyStageProps) => {
  const state = node.state as AutomatedMintReviewState
  const operation = node.operation as AutomatedIssuanceOperation
  const chain = state === 'BSC configuration' ? ChainId.BSC : ChainId.Base
  const isEntry = isAutomatedMintEntryState(state)
  const isConfiguration =
    state === 'Initial configuration' ||
    state === 'Trading paused' ||
    state === 'BSC configuration'
  const initialInput =
    state === 'Existing collateral only'
      ? REDEEM_COLLATERAL_ONLY_INPUT
      : isEntry || isConfiguration
        ? emptyInputFor(operation, chain)
        : defaultInputFor(operation, chain)
  const [input, setInput] = useState<AutomatedMintInputFixture>(initialInput)
  const [useExistingCollateral, setUseExistingCollateral] = useState(
    state === 'Existing collateral ready' ||
      state === 'Existing collateral only'
  )

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
          onInputChange={setInput}
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
      onRestart={() => onStateChange('Initial configuration')}
      hasCollateralSwaps={state !== 'No swaps needed'}
      input={input}
      onUseExistingCollateralChange={setUseExistingCollateral}
      operation={operation}
      setState={(next) => onStateChange(next)}
      state={state}
      useExistingCollateral={useExistingCollateral}
    />
  )
}

const StakeOwnerStage = ({ node, onStateChange }: FamilyStageProps) => (
  <StakeProductContext
    state={node.state as StakeReviewState}
    setState={onStateChange as (state: StakeReviewState) => void}
  />
)

const ManualOwnerStage = ({ node }: FamilyStageProps) => {
  const [remembered, setRemembered] = useState({
    amount: '100',
    unlimited: true,
  })
  return (
    <ManualIssuanceAnchor
      key={node.state}
      state={node.state as ManualReviewState}
      amount={remembered.amount}
      unlimited={remembered.unlimited}
      remember={(amount, unlimited) => setRemembered({ amount, unlimited })}
    />
  )
}

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
    .map(({ stateSlug, state }) => ({ value: stateSlug, label: state }))
  const operationIndex = operationNodes.indexOf(selection.node)
  const previous = operationNodes[operationIndex - 1]
  const next = operationNodes[operationIndex + 1]

  const navigateToNode = (node: TransactionFlowNode) =>
    navigate(
      {
        pathname: location.pathname,
        search: withFamilyNode(family, location.search, node),
        hash: `#${family.id}`,
      },
      { replace: true, preventScrollReset: true }
    )

  const navigateToFirst = (
    predicate: (node: TransactionFlowNode) => boolean
  ) => {
    const node = family.nodes.find(predicate)
    if (node) navigateToNode(node)
  }

  const stateHref = (node: TransactionFlowNode) =>
    `${location.pathname}${withFamilyNode(family, location.search, node)}#${family.id}`
  const isDefault =
    selection.node.state === family.defaultState && selection.view === 'current'
  const viewParams = new URLSearchParams(location.search)
  if (selection.view === 'all') viewParams.delete(familyKey(family, 'view'))
  else viewParams.set(familyKey(family, 'view'), 'all')
  const viewSearch = viewParams.toString() ? `?${viewParams.toString()}` : ''
  const familyTitle = t(family.title)

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
          name: t`${familyTitle} Workbench`,
          backgroundOwner: t`Family checkpoint host`,
          insetOwner: t`Transaction owner`,
        }}
        controls={{
          operation: (
            <SelectControl
              label={t`${familyTitle} operation`}
              value={selection.node.operation}
              options={operationOptions}
              onChange={(operation) =>
                navigateToFirst((node) => node.operation === operation)
              }
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
            onClick={() =>
              navigate(
                {
                  pathname: location.pathname,
                  search: resetFamilySearch(family, location.search),
                  hash: `#${family.id}`,
                },
                { replace: true, preventScrollReset: true }
              )
            }
          >
            <Trans>Reset family</Trans>
          </Button>
        }
        link={
          <Link
            href={`${location.pathname}${viewSearch}#${family.id}`}
            treatment="standalone"
          >
            {selection.view === 'all'
              ? t`Show current only`
              : t`Audit all states`}
          </Link>
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
        specimenClassName="min-h-[32rem] overflow-hidden"
      >
        <div
          key={`${selection.node.operation}-${selection.node.stateSlug}`}
          data-testid="transaction-current-specimen"
        >
          {stageFor(family, {
            node: selection.node,
            onStateChange: (state) =>
              navigateToFirst(
                (node) =>
                  node.operation === selection.node.operation &&
                  node.state === state
              ),
            onOperationChange: (operation) =>
              navigateToFirst((node) => node.operation === operation),
          })}
        </div>
      </DocumentationSpecimenCanvas>

      <nav
        aria-label={t`${familyTitle} ordered flow`}
        className="flex items-center justify-between gap-3"
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
        <p className="text-center text-xs text-muted-foreground">
          <Trans>
            {operationIndex + 1} of {operationNodes.length}
          </Trans>{' '}
          · {selection.node.state}
        </p>
        <Button
          className="min-h-11"
          disabled={!next}
          size="compact"
          tone="secondary"
          onClick={() => next && navigateToNode(next)}
        >
          <Trans>Next</Trans>
        </Button>
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
                  {node.state}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  )
}

export const DocumentationTransactionWorkbench = () => (
  <section
    id="transaction-workbench"
    aria-labelledby="transaction-workbench-title"
    className="scroll-mt-24 space-y-12"
  >
    <header className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        <Trans>Workbench · Exploring · Paused</Trans>
      </p>
      <h2 id="transaction-workbench-title" className={type.pageTitle}>
        <Trans>Transaction systems</Trans>
      </h2>
      <p className={cn(type.supporting, 'max-w-3xl text-muted-foreground')}>
        <Trans>
          These checkpoint compositions remain under review. Each family keeps
          its own operation, step, state order, and owner; this explorer is not
          a canonical product workflow or a universal transaction controller.
        </Trans>
      </p>
    </header>

    {TRANSACTION_FAMILIES.map((family) => (
      <TransactionFamilySection key={family.id} family={family} />
    ))}
  </section>
)

export default DocumentationTransactionWorkbench
