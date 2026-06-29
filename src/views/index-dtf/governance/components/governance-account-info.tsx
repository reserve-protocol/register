import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import EnsName from '@/components/utils/ens-name'
import { CurrentDtfVoteLock } from '@/components/vote-lock'
import { cn } from '@/lib/utils'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatPercentage } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { Trans, useLingui } from '@lingui/react/macro'
import {
  type IndexDtfVoterState,
  useIndexDtfVoterState,
} from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import {
  ArrowUpRight,
  CopyIcon,
  Pencil,
  Scale,
  UserRoundCog,
  Vote,
} from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'
import { Address, zeroAddress } from 'viem'

export interface IInfoItem {
  text: string | number | undefined
  title: string | React.ReactElement
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
      <strong className="text-right text-base">{text}</strong>
    )}
  </div>
)

const AddressActions = ({ address }: { address: Address }) => {
  const { t } = useLingui()
  const chainId = useAtomValue(chainIdAtom)
  const [isCopied, setIsCopied] = React.useState(false)
  const displayText = isCopied ? t`Copied to clipboard!` : t`Copy to clipboard`

  const handleCopy = (event: React.MouseEvent) => {
    event.stopPropagation()
    navigator.clipboard.writeText(address)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <>
      <Tooltip open={isCopied ? true : undefined} delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0 rounded-full px-0"
            onClick={handleCopy}
          >
            <CopyIcon size={12} strokeWidth={1.4} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">{displayText}</TooltipContent>
      </Tooltip>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="h-5 w-5 shrink-0 rounded-full px-0"
      >
        <Link
          to={getExplorerLink(address, chainId, ExplorerDataType.ADDRESS)}
          target="_blank"
        >
          <ArrowUpRight size={16} strokeWidth={1.75} />
        </Link>
      </Button>
    </>
  )
}

const DelegateItem = ({
  title,
  address,
  text,
}: {
  title: string | React.ReactElement
  address: Address | undefined
  text: string | undefined
}) => {
  const { t } = useLingui()

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-1.5">
      <span className="text-base text-legend">{title}</span>
      <div className="flex min-w-0 items-center">
        {text === undefined ? (
          <Skeleton className="h-4 w-24" />
        ) : (
          <span className="mr-2 truncate text-right text-base font-semibold">
            {address ? <EnsName address={address} /> : text}
          </span>
        )}
        {!!address && <AddressActions address={address} />}
        {text !== undefined && (
          <CurrentDtfVoteLock initialTab="delegate">
            <Button
              type="button"
              aria-label={t`Change delegate`}
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0 rounded-full px-0"
            >
              <Pencil size={12} strokeWidth={1.75} />
            </Button>
          </CurrentDtfVoteLock>
        )}
      </div>
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
    <div className="flex items-center justify-between gap-4 px-6 py-1.5">
      <span className="text-base text-legend">
        <InfoLabel icon={Vote}>
          <Trans>Vote locked</Trans>
        </InfoLabel>
      </span>
      {voteLocked === undefined ? (
        <Skeleton className="h-4 w-24" />
      ) : (
        <strong className="text-right text-base">
          {voteLocked} ${dtf?.stToken?.token.symbol}
        </strong>
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
  const { t } = useLingui()
  const normalDelegateAddress =
    voterState?.delegate && voterState.delegate !== zeroAddress
      ? voterState.delegate
      : undefined
  const optimisticDelegateAddress =
    voterState?.optimisticDelegate &&
    voterState.optimisticDelegate !== zeroAddress
      ? voterState.optimisticDelegate
      : undefined
  const isOptimisticGovernance = !!dtf?.stToken?.governance?.isOptimistic
  const votingWeight = voterState
    ? formatPercentage(voterState.votingWeight)
    : undefined
  const normalDelegate = voterState
    ? normalDelegateAddress
      ? normalDelegateAddress
      : t`Not delegated`
    : undefined
  const optimisticDelegate = voterState
    ? optimisticDelegateAddress
      ? optimisticDelegateAddress
      : t`Not delegated`
    : undefined

  if (!account) return null

  return (
    <div className="flex flex-col rounded-3xl bg-background pb-3">
      <div className="flex items-center px-6 pt-6 pb-2">
        <h4 className="text-xl font-semibold text-card-foreground">
          <Trans>Voting Power</Trans>
        </h4>
      </div>
      <div className="pt-2" />
      <VotingPower voterState={voterState} />
      <InfoItem
        title={
          <InfoLabel icon={Scale}>
            <Trans>Voting Weight</Trans>
          </InfoLabel>
        }
        text={votingWeight}
      />
      {isOptimisticGovernance && (
        <DelegateItem
          title={
            <InfoLabel icon={UserRoundCog}>
              <Trans>Optimistic delegate</Trans>
            </InfoLabel>
          }
          address={optimisticDelegateAddress}
          text={optimisticDelegate}
        />
      )}
      <DelegateItem
        title={
          <InfoLabel icon={UserRoundCog}>
            <Trans>Normal Delegate</Trans>
          </InfoLabel>
        }
        address={normalDelegateAddress}
        text={normalDelegate}
      />
    </div>
  )
}

export default GovernanceAccountInfo
