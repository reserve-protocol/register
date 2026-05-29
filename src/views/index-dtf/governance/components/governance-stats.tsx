import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatPercentage } from '@/utils'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { NotebookTabs } from 'lucide-react'
import React from 'react'
import { proposalCountAtom } from '../atoms'

export interface IInfoItem {
  text: string | number | undefined
  title: string | React.ReactElement
  className?: string
}

const InfoItem = ({
  title,
  text,
  className,
}: IInfoItem) => (
  <div className='flex flex-col gap-4 px-6 py-4 border-b'>
    <div className={cn('flex items-center', className)}>
      <div>
        <div className="flex items-center">
          <span className="text-legend text-sm">{title}</span>
        </div>
        {!text ? <Skeleton className="h-4 w-24" /> : <strong>{text}</strong>}
      </div>
    </div>
  </div>
)

const GovernanceStats = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const proposalCount = useAtomValue(proposalCountAtom)
  const totalDelegates = !dtf?.stToken ? undefined : dtf.stToken.currentDelegates + dtf.stToken.currentOptimisticDelegates
  const totalSupply = !dtf?.stToken?.token ? undefined : Number(dtf.stToken.token.totalSupply.formatted)
  const proposalThreshold = !dtf?.ownerGovernance ? undefined : dtf.ownerGovernance.proposalThreshold

  return (
    <div className="flex flex-col rounded-3xl bg-background">
      <div className='flex items-center px-4 pt-4 pb-2 gap-4'>
        <div className="border rounded-full border-foreground p-1">
          <NotebookTabs size={14} />
        </div>
        <h4 className='text-xl font-semibold text-primary'><Trans>Information</Trans></h4>
      </div>
      <InfoItem
        title={<Trans>Proposals</Trans>}
        text={proposalCount}
      />
      <InfoItem
        title={<Trans>Vote Supply</Trans>}
        text={totalSupply ? `${formatCurrency(totalSupply, 0)} ${dtf?.stToken?.token.symbol}` : undefined}
      />
      <InfoItem
        title={<Trans>Proposal Threshold</Trans>}
        text={proposalThreshold ? formatPercentage(proposalThreshold) : undefined}
      />
      <InfoItem
        title={<Trans>Voting addresses</Trans>}
        text={totalDelegates}
      />
    </div>
  )
}

export default GovernanceStats
