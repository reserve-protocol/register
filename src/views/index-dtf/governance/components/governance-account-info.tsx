import CopyValue from '@/components/ui/copy-value'
import { Skeleton } from '@/components/ui/skeleton'
import { useEnsName } from '@/hooks/use-ens-name'
import { cn } from '@/lib/utils'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatPercentage } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { Trans } from '@lingui/react/macro'
import {
  type IndexDtfVoterState,
  useIndexDtfVoterState,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, Vote } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'
import { Address, zeroAddress } from 'viem'

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

const DelegateItem = ({
  title,
  address,
  text,
}: {
  title: string | React.ReactElement
  address: Address | undefined
  text: string | undefined
}) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="flex items-center py-4 px-6 border-b">
      <div className="mr-auto">
        <span className="text-legend text-sm block">{title}</span>
        {text === undefined ? (
          <Skeleton className="h-4 w-24" />
        ) : (
          <strong>{text}</strong>
        )}
      </div>
      {!!address && (
        <>
          <div className="p-1 bg-muted rounded-full mr-2">
            <CopyValue value={address} />
          </div>
          <Link
            to={getExplorerLink(address, chainId, ExplorerDataType.ADDRESS)}
            target="_blank"
            className="p-1 bg-muted rounded-full"
          >
            <ArrowUpRight size={14} />
          </Link>
        </>
      )}
    </div>
  )
}

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

  const params =
    account && dtf?.stToken?.id
      ? {
        chainId: dtf.chainId,
        stToken: dtf.stToken.id,
        account,
      }
      : undefined

  const { data: voterState } = useIndexDtfVoterState(params)

  return voterState
}

const GovernanceAccountInfo = () => {
  const account = useAtomValue(walletAtom)
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

  if (!account) return null

  return (
    <div className="flex flex-col rounded-3xl bg-background">
      <div className='flex items-center px-4 pt-4 pb-2 gap-4'>
        <div className="border rounded-full border-foreground p-1">
          <Vote size={14} />
        </div>
        <h4 className='text-xl font-semibold text-primary'><Trans>Voting Power</Trans></h4>
      </div>
      <VotingPower voterState={voterState} />
      <InfoItem
        title={<Trans>Voting Weight</Trans>}
        text={votingWeight}
      />
      {isOptimisticGovernance && (
        <DelegateItem
          title={<Trans>Optimistic delegate</Trans>}
          address={optimisticDelegateAddress}
          text={optimisticDelegate}
        />
      )}
      <DelegateItem
        title={<Trans>Normal Delegate</Trans>}
        address={normalDelegateAddress}
        text={normalDelegate}
      />
    </div>
  )
}

export default GovernanceAccountInfo
