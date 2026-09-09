import { Skeleton } from '@/components/ui/skeleton'
import { Trans } from '@lingui/react/macro'
import GovernanceIcon from 'components/icons/GovernanceIcon'
import ProposalCard from './proposal-card'
import useOngoingProposals from './use-ongoing-proposals'

const ProposalSkeleton = () => (
  <div className="space-y-5 rounded-3xl border bg-card p-5">
    <div className="flex gap-2">
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-28 rounded-full" />
    </div>
    <Skeleton className="h-7 w-4/5" />
    <Skeleton className="h-10 w-1/2" />
    <div className="grid gap-3 sm:grid-cols-3">
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-24 rounded-2xl" />
    </div>
  </div>
)

const OngoingGovernance = () => {
  const { proposals, isLoading, errors, warnings } = useOngoingProposals()

  return (
    <div
      data-testid="ongoing-governance-page"
      className="mx-2 my-6 md:mx-4 md:my-8"
    >
      <div className="mb-8 flex items-start gap-3 px-2">
        <GovernanceIcon fontSize={32} />
        <div>
          <h1 className="text-xl font-semibold">
            <Trans>Ongoing Index DTF proposals</Trans>
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            <Trans>
              Active and pending proposals across Ethereum, Base, and BSC.
              Values refresh periodically, and USD estimates use the governance
              token's underlying asset price.
            </Trans>
          </p>
        </div>
      </div>

      {(errors.length > 0 || warnings.length > 0) && (
        <div
          data-testid="ongoing-governance-warning"
          className="mb-5 rounded-2xl border bg-muted/50 p-4 text-sm"
        >
          {errors.some((error) => error.type === 'discovery') && (
            <p>
              <Trans>Index DTF discovery is currently unavailable.</Trans>
            </p>
          )}
          {errors
            .filter((error) => error.type === 'chain')
            .map((error) => (
              <p key={error.chainId}>
                <Trans>
                  Proposal data for chain {error.chainId} is currently
                  unavailable.
                </Trans>
              </p>
            ))}
          {warnings.includes('proposal-limit') && (
            <p>
              <Trans>
                The proposal result limit was reached, so some proposals may be
                unavailable.
              </Trans>
            </p>
          )}
          {warnings.includes('governance-limit') && (
            <p>
              <Trans>
                The governance query limit was reached, so that chain is not
                displayed.
              </Trans>
            </p>
          )}
        </div>
      )}

      {isLoading && proposals.length === 0 ? (
        <div
          data-testid="ongoing-governance-loading"
          className="grid gap-5 xl:grid-cols-2"
        >
          <ProposalSkeleton />
          <ProposalSkeleton />
        </div>
      ) : proposals.length > 0 ? (
        <div
          data-testid="ongoing-governance-list"
          className="grid gap-5 xl:grid-cols-2"
        >
          {proposals.map((proposal) => (
            <ProposalCard
              key={`${proposal.chainId}:${proposal.governance}:${proposal.id}`}
              proposal={proposal}
            />
          ))}
        </div>
      ) : (
        <div
          data-testid="ongoing-governance-empty"
          className="rounded-3xl border bg-card px-6 py-16 text-center"
        >
          <p className="font-semibold">
            <Trans>No ongoing Index DTF proposals</Trans>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            <Trans>Active and pending proposals will appear here.</Trans>
          </p>
        </div>
      )}
    </div>
  )
}

export default OngoingGovernance
