import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Trans, useLingui } from '@lingui/react/macro'
import InactiveBadge from 'components/inactive-badge'
import TokenLogo from 'components/token-logo'
import { ArrowUpRight } from 'lucide-react'
import { getFolioRoute, getProposalTitle } from 'utils'
import { CHAIN_TO_NETWORK, ROUTES, capitalize } from 'utils/constants'
import { formatRawAmount, formatUsdAmount } from './utils'
import { type OngoingProposal } from './use-ongoing-proposals'

const badgeClasses = {
  state: 'bg-primary/15 text-primary',
  rebalance: 'bg-success/15 text-success',
  critical: 'bg-destructive/15 text-destructive',
  other: 'bg-muted text-muted-foreground',
} as const

const Badge = ({
  children,
  className,
  testId,
  value,
}: {
  children: React.ReactNode
  className: string
  testId: string
  value: string
}) => (
  <span
    data-testid={testId}
    data-value={value}
    className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}
  >
    {children}
  </span>
)

const Timeline = ({
  label,
  timestamp,
  testId,
}: {
  label: React.ReactNode
  timestamp: number
  testId: string
}) => (
  <div>
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd
      data-testid={testId}
      data-timestamp={timestamp}
      className="mt-1 text-sm font-medium"
    >
      <time dateTime={new Date(timestamp * 1000).toISOString()}>
        {new Intl.DateTimeFormat(undefined, {
          dateStyle: 'medium',
          timeStyle: 'long',
        }).format(new Date(timestamp * 1000))}
      </time>
    </dd>
  </div>
)

const VoteGap = ({
  label,
  raw,
  proposal,
  testId,
}: {
  label: React.ReactNode
  raw: bigint | undefined
  proposal: OngoingProposal
  testId: string
}) => {
  const token = proposal.voteToken
  const tokenAmount =
    raw !== undefined && token
      ? `${formatRawAmount(raw, token.decimals)} ${token.symbol}`
      : undefined
  const usdAmount =
    raw !== undefined && token
      ? formatUsdAmount(raw, token.decimals, token.price)
      : undefined

  return (
    <div className="rounded-2xl border bg-background p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        data-testid={`${testId}-token`}
        data-raw={raw?.toString()}
        className="mt-2 text-base font-semibold"
      >
        {tokenAmount ?? <Trans>Unavailable</Trans>}
      </dd>
      <dd
        data-testid={`${testId}-usd`}
        data-available={usdAmount !== undefined}
        className="mt-1 text-xs text-muted-foreground"
      >
        {usdAmount ?? <Trans>USD unavailable</Trans>}
      </dd>
    </div>
  )
}

const BooleanValue = ({
  value,
  testId,
}: {
  value: boolean | undefined
  testId: string
}) => (
  <span
    data-testid={testId}
    data-value={value === undefined ? 'unavailable' : value}
    className="font-medium"
  >
    {value === undefined ? (
      <Trans>Unavailable</Trans>
    ) : value ? (
      <Trans>Yes</Trans>
    ) : (
      <Trans>No</Trans>
    )}
  </span>
)

const ProposalCard = ({ proposal }: { proposal: OngoingProposal }) => {
  const { t } = useLingui()
  const title = getProposalTitle(proposal.description) || t`Untitled proposal`
  const category =
    proposal.category === 'rebalance'
      ? t`Rebalance`
      : proposal.category === 'critical'
        ? t`Critical setting`
        : proposal.category === 'other'
          ? t`Other`
          : t`Unavailable`
  const categoryClass =
    proposal.category === 'rebalance'
      ? badgeClasses.rebalance
      : proposal.category === 'critical'
        ? badgeClasses.critical
        : badgeClasses.other
  const state = proposal.state === 'PENDING' ? t`Pending` : t`Active`
  const route = getFolioRoute(
    proposal.primaryDtf.address,
    proposal.chainId,
    `${ROUTES.GOVERNANCE_PROPOSAL}/${proposal.id}`
  )

  return (
    <Card
      data-testid="ongoing-governance-proposal-card"
      data-proposal-id={proposal.id}
      className="overflow-hidden border"
    >
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            testId="ongoing-governance-state"
            className={badgeClasses.state}
            value={proposal.state.toLowerCase()}
          >
            {state}
          </Badge>
          <Badge
            testId="ongoing-governance-category"
            className={categoryClass}
            value={proposal.category ?? 'unavailable'}
          >
            {category}
          </Badge>
          <span className="text-xs font-medium text-muted-foreground">
            {capitalize(CHAIN_TO_NETWORK[proposal.chainId])}
          </span>
        </div>
        <div>
          <CardTitle className="leading-snug [overflow-wrap:anywhere]">
            <a
              data-testid="ongoing-governance-proposal-link"
              href={route}
              className="inline-flex items-start gap-2 hover:underline"
            >
              <span>{title}</span>
              <ArrowUpRight className="mt-1 size-4 shrink-0" />
            </a>
          </CardTitle>
          <CardDescription className="mt-3">
            <Trans>Governed DTFs</Trans>
          </CardDescription>
          <div
            data-testid="ongoing-governance-dtfs"
            className="mt-2 flex flex-wrap gap-2"
          >
            {proposal.dtfs.map((dtf) => (
              <span
                key={dtf.address}
                data-dtf-status={dtf.status}
                className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm font-medium"
              >
                <TokenLogo
                  size="sm"
                  src={dtf.brand?.icon}
                  symbol={dtf.symbol}
                  address={dtf.address}
                  chain={proposal.chainId}
                />
                {dtf.symbol}
                {dtf.status !== 'active' && <InactiveBadge />}
              </span>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Timeline
            label={<Trans>Voting starts</Trans>}
            timestamp={proposal.voteStart}
            testId="ongoing-governance-vote-start"
          />
          <Timeline
            label={<Trans>Voting ends</Trans>}
            timestamp={proposal.voteEnd}
            testId="ongoing-governance-vote-end"
          />
        </dl>

        <dl className="grid gap-3 sm:grid-cols-3">
          <VoteGap
            label={
              proposal.isOptimistic ? (
                <Trans>Veto shortfall</Trans>
              ) : (
                <Trans>Quorum shortfall</Trans>
              )
            }
            raw={proposal.gaps.threshold}
            proposal={proposal}
            testId="ongoing-governance-threshold"
          />
          <VoteGap
            label={<Trans>Additional votes to pass</Trans>}
            raw={proposal.gaps.pass}
            proposal={proposal}
            testId="ongoing-governance-pass"
          />
          <VoteGap
            label={<Trans>Additional votes to defeat</Trans>}
            raw={proposal.gaps.defeat}
            proposal={proposal}
            testId="ongoing-governance-defeat"
          />
        </dl>

        <dl className="grid gap-4 border-t pt-5 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-sm text-muted-foreground">
              <Trans>Has votes</Trans>
            </dt>
            <dd>
              <BooleanValue
                value={proposal.hasVotes}
                testId="ongoing-governance-has-votes"
              />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-sm text-muted-foreground">
              <Trans>Proposer voted</Trans>
            </dt>
            <dd>
              <BooleanValue
                value={proposal.proposerVoted}
                testId="ongoing-governance-proposer-voted"
              />
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

export default ProposalCard
