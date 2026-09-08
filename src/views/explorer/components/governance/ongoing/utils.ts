import {
  dtfIndexGovernanceProposalAbi,
  dtfIndexProposalAbi,
  timelockAbi,
  type ProposalState,
} from '@reserve-protocol/react-sdk'
import {
  decodeFunctionData,
  formatUnits,
  toFunctionSelector,
  type Abi,
  type AbiFunction,
  type Address,
  type Hex,
} from 'viem'
import Decimal from 'decimal.js-light'

export type ProposalCategory = 'rebalance' | 'critical' | 'other'

export type ProposalContractContext = {
  rebalanceTargets: ReadonlySet<string>
  trustedTargets: ReadonlySet<string>
}

type ProposalGapParams = {
  state: ProposalState
  isOptimistic: boolean
  quorum: bigint
  forVotes: bigint
  againstVotes: bigint
  abstainVotes: bigint
  optimisticTarget?: bigint
}

export type ProposalGaps = {
  threshold?: bigint
  pass?: bigint
  defeat?: bigint
}

const max = (...values: bigint[]) =>
  values.reduce((result, value) => (value > result ? value : result), 0n)

export const calculateProposalGaps = ({
  state,
  isOptimistic,
  quorum,
  forVotes,
  againstVotes,
  abstainVotes,
  optimisticTarget,
}: ProposalGapParams): ProposalGaps => {
  if (isOptimistic) {
    if (optimisticTarget === undefined) {
      return {
        threshold: undefined,
        pass: undefined,
        defeat: undefined,
      }
    }

    const vetoShortfall = max(optimisticTarget - againstVotes, 0n)

    return {
      threshold: vetoShortfall,
      pass: 0n,
      defeat: vetoShortfall,
    }
  }

  const defeat = max(forVotes - againstVotes, 0n)
  if (state === 'PENDING' && quorum === 0n) {
    return {
      threshold: undefined,
      pass: undefined,
      defeat,
    }
  }

  const quorumShortfall = max(quorum - (forVotes + abstainVotes), 0n)

  return {
    threshold: quorumShortfall,
    pass: max(quorumShortfall, againstVotes - forVotes + 1n, 0n),
    defeat,
  }
}

const selectorsFor = (abi: Abi, names: ReadonlySet<string>) =>
  new Set(
    abi
      .filter(
        (item): item is AbiFunction =>
          item.type === 'function' && names.has(item.name)
      )
      .map((item) => toFunctionSelector(item))
  )

const REBALANCE_SELECTORS = selectorsFor(
  dtfIndexProposalAbi,
  new Set(['startRebalance'])
)

const CRITICAL_SELECTORS = new Set([
  ...selectorsFor(
    dtfIndexGovernanceProposalAbi,
    new Set([
      'setVotingDelay',
      'setVotingPeriod',
      'setProposalThreshold',
      'updateQuorumNumerator',
      'updateTimelock',
      'setLateQuorumVoteExtension',
      'setOptimisticParams',
      'setProposalThrottle',
    ])
  ),
  ...selectorsFor(timelockAbi, new Set(['grantRole', 'updateDelay'])),
])

const RELAY_SELECTOR = selectorsFor(
  dtfIndexGovernanceProposalAbi,
  new Set(['relay'])
)
  .values()
  .next().value

const classifyCall = (
  target: Address,
  calldata: Hex,
  context: ProposalContractContext,
  unwrapRelay: boolean
): ProposalCategory => {
  if (calldata.length < 10) return 'other'

  const normalizedTarget = target.toLowerCase()
  const selector = calldata.slice(0, 10) as Hex

  if (
    context.rebalanceTargets.has(normalizedTarget) &&
    REBALANCE_SELECTORS.has(selector)
  ) {
    return 'rebalance'
  }

  if (
    context.trustedTargets.has(normalizedTarget) &&
    CRITICAL_SELECTORS.has(selector)
  ) {
    return 'critical'
  }

  if (
    unwrapRelay &&
    context.trustedTargets.has(normalizedTarget) &&
    selector === RELAY_SELECTOR
  ) {
    try {
      const decoded = decodeFunctionData({
        abi: dtfIndexGovernanceProposalAbi,
        data: calldata,
      })

      if (decoded.functionName === 'relay' && decoded.args) {
        const [innerTarget, , innerCalldata] = decoded.args
        return classifyCall(innerTarget, innerCalldata, context, false)
      }
    } catch {
      return 'other'
    }
  }

  return 'other'
}

export const classifyProposal = (
  targets: readonly Address[],
  calldatas: readonly Hex[],
  context: ProposalContractContext
): ProposalCategory => {
  let category: ProposalCategory = 'other'

  for (let index = 0; index < targets.length; index++) {
    const calldata = calldatas[index]
    if (!calldata) continue

    const callCategory = classifyCall(targets[index], calldata, context, true)
    if (callCategory === 'rebalance') return callCategory
    if (callCategory === 'critical') category = callCategory
  }

  return category
}

const addThousandsSeparators = (value: string) =>
  value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export const formatRawAmount = (
  raw: bigint,
  decimals: number,
  maximumFractionDigits = 6
) => {
  const [integer, fraction = ''] = formatUnits(raw, decimals).split('.')
  const visibleFraction = fraction
    .slice(0, maximumFractionDigits)
    .replace(/0+$/, '')

  if (
    raw > 0n &&
    integer === '0' &&
    fraction.length > maximumFractionDigits &&
    !visibleFraction
  ) {
    return `< 0.${'0'.repeat(maximumFractionDigits - 1)}1`
  }

  return `${addThousandsSeparators(integer)}${
    visibleFraction ? `.${visibleFraction}` : ''
  }`
}

export const formatUsdAmount = (
  raw: bigint,
  decimals: number,
  price: number | undefined
) => {
  if (price === undefined || !Number.isFinite(price) || price <= 0) {
    return undefined
  }

  const value = new Decimal(formatUnits(raw, decimals)).mul(
    new Decimal(price.toString())
  )
  if (value.isZero()) return '$0.00'
  if (value.lessThan('0.01')) return '< $0.01'

  const [integer, fraction] = value.toDecimalPlaces(2).toFixed(2).split('.')
  return `$${addThousandsSeparators(integer)}.${fraction}`
}
