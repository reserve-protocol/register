import { getOptimisticActions } from '@/views/index-dtf/governance/views/propose/views/propose-dtf-settings/optimistic'
import {
  sortIndexDtfFeeRecipients,
  type IndexDtfDeployAdditionalDetailsV6,
  type IndexDtfDeployFlags,
  type IndexDtfDeployGovernanceRoles,
  type IndexDtfDeployOptimisticGovernanceParams,
  type IndexDtfFeeRecipient,
} from '@reserve-protocol/react-sdk'
import { getAddress, zeroAddress, type Address, type Hex } from 'viem'
import type { DeployInputs } from '../form-fields'

const D18 = 10n ** 18n
const DAY = 86_400
const HOUR = 3_600

// Percent with up to 6 decimals → D18 fraction, in integers so no float rounding reaches the contract.
const percentToD18 = (percent: number) =>
  BigInt(Math.round(percent * 1e6)) * 10n ** 10n
// Shares are entered to 0.01%; work in hundredths of a percent.
const toCents = (percent: number) => BigInt(Math.round(percent * 100))
const seconds = (amount: number, unit: number) =>
  BigInt(Math.round(amount * unit))
const addresses = (values: (string | undefined)[]) =>
  values
    .filter((value): value is string => !!value)
    .map((value) => getAddress(value))

type Share = { recipient: Address; cents: bigint; immutable: boolean }

// Form shares are % of all revenue; 6.0 wants holders as a fraction of non-platform and both tables of what holders leave.
const buildFees = (
  inputs: DeployInputs,
  deployer: Address,
  governanceRecipient: Address | undefined
) => {
  const nonPlatform = toCents(100) - toCents(inputs.fixedPlatformFee)
  const holders = toCents(inputs.holderShare)
  const pool = nonPlatform - holders

  const shares: Share[] = [
    ...(governanceRecipient
      ? [
          {
            recipient: governanceRecipient,
            cents: toCents(inputs.governanceShare),
            immutable: false,
          },
        ]
      : []),
    {
      recipient: deployer,
      cents: toCents(inputs.deployerShare),
      immutable: false,
    },
    ...(inputs.additionalRevenueRecipients ?? []).map((r) => ({
      recipient: getAddress(r.address),
      cents: toCents(r.share),
      immutable: false,
    })),
    ...(inputs.permanentRevenueRecipients ?? []).map((r) => ({
      recipient: getAddress(r.address),
      cents: toCents(r.share),
      immutable: true,
    })),
  ].filter((share) => share.cents > 0n)

  if (!governanceRecipient && toCents(inputs.governanceShare) > 0n)
    throw new Error('A governance share needs a vote-lock vault to receive it.')
  // The last row absorbs only rounding; a gap here would silently land on it, possibly a permanent recipient.
  const allocated = shares.reduce((sum, share) => sum + share.cents, 0n)
  if (allocated !== pool)
    throw new Error(
      'Revenue shares must add up to 100% together with the platform and holder shares.'
    )

  const portions =
    pool > 0n ? shares.map((share) => (share.cents * D18) / pool) : []
  if (portions.length) {
    const others = portions
      .slice(0, -1)
      .reduce((sum, portion) => sum + portion, 0n)
    portions[portions.length - 1] = D18 - others
  }
  const table = (immutable: boolean): IndexDtfFeeRecipient[] =>
    sortIndexDtfFeeRecipients(
      shares.flatMap((share, index) =>
        share.immutable === immutable && portions[index]
          ? [{ recipient: share.recipient, portion: portions[index] }]
          : []
      )
    )

  return {
    selfFee: nonPlatform > 0n ? (holders * D18) / nonPlatform : 0n,
    feeRecipients: table(false),
    immutableFeeRecipients: table(true),
  }
}

export type V6DeployParams = {
  additionalDetails: IndexDtfDeployAdditionalDetailsV6
  governance: IndexDtfDeployOptimisticGovernanceParams
  roles: IndexDtfDeployGovernanceRoles
  flags: IndexDtfDeployFlags
}

export const buildV6Governance = (
  inputs: DeployInputs
): IndexDtfDeployOptimisticGovernanceParams => ({
  optimistic: {
    vetoDelay: seconds(inputs.optimisticVetoDelay, HOUR),
    vetoPeriod: seconds(inputs.optimisticVetoPeriod, HOUR),
    vetoThreshold: percentToD18(inputs.optimisticVetoThreshold),
  },
  standard: {
    votingDelay: seconds(inputs.governanceVotingDelay, DAY),
    votingPeriod: seconds(inputs.governanceVotingPeriod, DAY),
    voteExtension: seconds(inputs.governanceVoteExtension, DAY),
    proposalThreshold: percentToD18(inputs.governanceVotingThreshold),
    quorumNumerator: percentToD18(inputs.governanceVotingQuorum),
  },
  optimisticSelectors: getOptimisticActions(6)
    .filter((action) => inputs.optimisticActions.includes(action.id))
    .map((action) => action.selector as Hex),
  optimisticProposers: addresses(inputs.optimisticProposers),
  additionalGuardians: addresses(inputs.guardians),
  timelockDelay: seconds(inputs.governanceExecutionDelay, DAY),
  proposalThrottleCapacity: BigInt(inputs.proposalThrottleCapacity),
})

export const buildV6DeployParams = (
  inputs: DeployInputs,
  {
    deployer,
    governanceRecipient,
  }: { deployer: Address; governanceRecipient?: Address }
): V6DeployParams => ({
  additionalDetails: {
    maxAuctionLength: seconds(inputs.maxAuctionLength, 60),
    ...buildFees(inputs, deployer, governanceRecipient),
    tvlFee: percentToD18(inputs.folioFee),
    mintFee: percentToD18(inputs.mintFee),
    mandate: inputs.mandate ?? '',
  },
  governance: buildV6Governance(inputs),
  roles: {
    existingBasketManagers: [],
    auctionLaunchers: addresses(inputs.auctionLaunchers),
    brandManagers: addresses(inputs.brandManagers),
  },
  flags: {
    trustedFillerEnabled: true,
    rebalanceControl: {
      weightControl: inputs.weightControl,
      priceControl: 1,
    },
    bidsEnabled: inputs.bidsEnabled,
  },
})

// undefined = still loading; a vault without a readable token jar blocks the deploy instead of misrouting fees.
export const resolveGovernanceRecipient = (
  stToken: Address | undefined,
  recipient:
    | { stToken: Address; tokenJar?: Address; error?: string }
    | undefined
): { ready: boolean; recipient?: Address; error?: string } => {
  if (!stToken) return { ready: true }
  if (!recipient || recipient.stToken.toLowerCase() !== stToken.toLowerCase())
    return { ready: false }
  if (recipient.error) return { ready: false, error: recipient.error }
  if (!recipient.tokenJar) return { ready: false }
  if (recipient.tokenJar === zeroAddress)
    return { ready: false, error: 'This vault has no token jar to receive governance fees.' }
  return { ready: true, recipient: recipient.tokenJar }
}
