import { Skeleton } from '@/components/ui/skeleton'
import { useEnsName } from '@/hooks/use-ens-name'
import { cn } from '@/lib/utils'
import { walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatPercentage } from '@/utils'
import { voteLockStateRefreshTokenAtom } from '@/views/index-dtf/overview/components/staking/atoms'
import { Trans } from '@lingui/react/macro'
import {
  type IndexDtfVoterState,
  useIndexDtfVoterState,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { NotebookTabs } from 'lucide-react'
import React, { useEffect, useRef } from 'react'
import { zeroAddress } from 'viem'

export interface IInfoItem {
  text: string | number | undefined
  title: string | React.ReactElement
  className?: string
}

// TODO: duplicated component on governance-stats.tsx.. but is alright
const InfoItem = ({
  title,
  text,
  className,
}: IInfoItem) => (
  <div className='flex flex-col gap-4 py-4 px-6 border-b'>
    <div className={cn('flex items-center', className)}>
      <div>
        <div className="flex items-center">
          <span className="text-legend text-sm">{title}</span>
        </div>
        {text === undefined ? <Skeleton className="h-4 w-24" /> : <strong>{text}</strong>}
      </div>
    </div>
  </div>
)

const VotingPower = ({
  voterState,
}: {
  voterState: IndexDtfVoterState | undefined
}) => {
  const dtf = useAtomValue(indexDTFAtom)
  const voteLocked = voterState
    ? formatCurrency(Number(voterState.balance.formatted), 1, {
      notation: 'compact',
      compactDisplay: 'short',
    })
    : undefined

  return (
    <div className="flex flex-col px-6 py-4 border-b">
      <span className="text-legend text-sm">Vote locked</span>
      {voteLocked === undefined ? (
        <Skeleton className="h-4 w-24" />
      ) : (
        <span className="font-semibold">
          {voteLocked} ${dtf?.stToken?.token.symbol}
        </span>
      )}
    </div>
  )
}

const useVoterState = () => {
  const account = useAtomValue(walletAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const refreshToken = useAtomValue(voteLockStateRefreshTokenAtom)
  const previousRefreshToken = useRef(refreshToken)

  const params =
    account && dtf?.stToken?.id
      ? {
        chainId: dtf.chainId,
        stToken: dtf.stToken.id,
        account,
      }
      : undefined

  const { data: voterState, refetch } = useIndexDtfVoterState(params)

  useEffect(() => {
    if (previousRefreshToken.current === refreshToken) return

    previousRefreshToken.current = refreshToken

    if (params) void refetch()
  }, [!!params, refetch, refreshToken])

  return voterState
}

const GovernanceAccountInfo = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const voterState = useVoterState()
  const normalDelegateAddress =
    voterState?.delegate && voterState.delegate !== zeroAddress
      ? voterState.delegate
      : undefined
  const optimisticDelegateAddress =
    voterState?.optimisticDelegate && voterState.optimisticDelegate !== zeroAddress
      ? voterState.optimisticDelegate
      : undefined
  const normalDelegateName = useEnsName(normalDelegateAddress)
  const optimisticDelegateName = useEnsName(optimisticDelegateAddress)
  const isOptimisticGovernance = !!dtf?.stToken?.governance?.isOptimistic
  const votingWeight = voterState ? formatPercentage(voterState.votingWeight) : undefined
  const normalDelegate = voterState
    ? normalDelegateAddress
      ? normalDelegateName
      : 'Not delegated'
    : undefined
  const optimisticDelegate = voterState
    ? optimisticDelegateAddress
      ? optimisticDelegateName
      : 'Not delegated'
    : undefined

  return (
    <div className="flex flex-col rounded-3xl bg-background">
      <div className='flex items-center px-4 pt-4 pb-2 gap-4'>
        <div className="border rounded-full border-foreground p-1">
          <NotebookTabs size={14} />
        </div>
        <h4 className='text-xl font-semibold text-primary'><Trans>Voting Power</Trans></h4>
      </div>
      <VotingPower voterState={voterState} />
      <InfoItem
        title={<Trans>Voting Weight</Trans>}
        text={votingWeight}
      />
      {isOptimisticGovernance && (
        <InfoItem
          title={<Trans>Optimistic delegate</Trans>}
          text={optimisticDelegate}
        />
      )}
      <InfoItem
        title={<Trans>Normal Delegate</Trans>}
        text={normalDelegate}
      />
    </div>
  )
}

export default GovernanceAccountInfo
