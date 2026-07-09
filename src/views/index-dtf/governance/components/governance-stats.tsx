import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatPercentage } from '@/utils'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { Coins, FileText, Gauge, Users } from 'lucide-react'
import React from 'react'
import { proposalCountAtom } from '../atoms'

export interface IInfoItem {
  text: string | number | undefined
  title: React.ReactNode
  className?: string
}

const InfoLabel = ({
  icon: Icon,
  children,
}: {
  icon: React.ElementType
  children: React.ReactNode
}) => (
  <span className="inline-flex items-center gap-2.5">
    <Icon size={14} strokeWidth={1.75} className="hidden sm:block" />
    {children}
  </span>
)

const InfoGroupLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 pb-3 pt-4 text-xs font-medium uppercase text-foreground">
    {children}
  </div>
)

const InfoItem = ({ title, text, className }: IInfoItem) => (
  <div
    className={cn(
      'flex items-center justify-between gap-4 px-6 py-1.5',
      className
    )}
  >
    <span className="text-base text-legend">{title}</span>
    {text === undefined ? (
      <Skeleton className="h-4 w-24" />
    ) : (
      <strong className="text-base text-right">{text}</strong>
    )}
  </div>
)

const GovernanceStats = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const proposalCount = useAtomValue(proposalCountAtom)
  const totalDelegates = !dtf?.stToken
    ? undefined
    : dtf.stToken.currentDelegates + dtf.stToken.currentOptimisticDelegates
  const totalSupply = !dtf?.stToken?.token
    ? undefined
    : Number(dtf.stToken.token.totalSupply.formatted)
  const proposalThreshold = !dtf?.ownerGovernance
    ? undefined
    : dtf.ownerGovernance.proposalThreshold

  return (
    <div className="flex flex-col rounded-3xl pb-3 bg-background">
      <div className="flex items-center px-6 pt-6 pb-2">
        <h4 className="text-xl font-semibold text-card-foreground">
          <Trans>Governance Stats</Trans>
        </h4>
      </div>
      <InfoGroupLabel>
        <Trans>This DTF</Trans>
      </InfoGroupLabel>
      <InfoItem
        title={
          <InfoLabel icon={FileText}>
            <Trans>Proposals</Trans>
          </InfoLabel>
        }
        text={proposalCount}
      />
      <InfoItem
        title={
          <InfoLabel icon={Gauge}>
            <Trans>Proposal Threshold</Trans>
          </InfoLabel>
        }
        text={
          proposalThreshold === undefined
            ? undefined
            : formatPercentage(proposalThreshold)
        }
      />
      <InfoGroupLabel>
        <Trans>${dtf?.stToken?.token.symbol ?? 'Vote-lock'} DAO</Trans>
      </InfoGroupLabel>
      <InfoItem
        title={
          <InfoLabel icon={Coins}>
            <Trans>Vote Supply</Trans>
          </InfoLabel>
        }
        text={
          totalSupply === undefined
            ? undefined
            : `${formatCurrency(totalSupply, 0)} ${dtf?.stToken?.token.symbol}`
        }
      />
      <InfoItem
        title={
          <InfoLabel icon={Users}>
            <Trans>Voting addresses</Trans>
          </InfoLabel>
        }
        text={totalDelegates}
      />
    </div>
  )
}

export default GovernanceStats
