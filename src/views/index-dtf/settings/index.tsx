import dtfIndexAbi from '@/abis/dtf-index-abi'
import CopyValue from '@/components/old/button/CopyValue'
import { TransactionButtonContainer } from '@/components/old/button/TransactionButton'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatPercentage, parseDuration, shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { t } from '@lingui/macro'
import { atom, useAtomValue } from 'jotai'
import {
  ArrowUpRight,
  Braces,
  Calendar1,
  ChartPie,
  DollarSign,
  FileLock2,
  Hash,
  Image,
  MousePointerBan,
  MousePointerClick,
  Pause,
  ShieldCheck,
  ShieldHalf,
  Signature,
  TableRowsSplit,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatEther } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

const IconWrapper = ({ Component }: { Component: React.ElementType }) => (
  <div className="border rounded-full border-foreground p-2">
    <Component size={14} />
  </div>
)

// TODO: Worth to make re-usable
const InfoCard = ({
  title,
  action,
  children,
  secondary = false,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  secondary?: boolean
}) => (
  <Card
    className={cn(
      'rounded-3xl flex flex-col bg-secondary',
      secondary && 'bg-primary/10'
    )}
  >
    <div className="p-4 flex items-center gap-2">
      <h1 className="font-bold text-xl text-primary mr-auto">{title}</h1>
      {action}
    </div>
    <div
      className={cn(
        'bg-card mx-1 mb-1 rounded-3xl',
        secondary && 'bg-background'
      )}
    >
      {children}
    </div>
  </Card>
)

const InfoCardItem = ({
  label,
  icon,
  value,
  className,
  address,
  bold = true,
  border = true,
}: {
  label: string
  icon: React.ReactNode
  value?: React.ReactNode
  className?: string
  bold?: boolean
  address?: string
  border?: boolean
}) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div
      className={cn('flex items-center p-4', className, border && 'border-t')}
    >
      {icon}
      <div className="ml-3 mr-auto">
        <div className="flex items-center">
          <span className="text-legend text-sm">{label}</span>
        </div>
        {!value ? (
          <Skeleton className="h-4 w-24" />
        ) : (
          <span className={cn(bold && 'font-bold')}>{value}</span>
        )}
      </div>
      {!!address && (
        <div className="flex items-center gap-2">
          <div className="p-1 bg-muted rounded-full">
            <CopyValue value={address} />
          </div>
          <Link
            to={getExplorerLink(address, chainId, ExplorerDataType.ADDRESS)}
            target="_blank"
            className="p-1 bg-muted rounded-full"
          >
            <ArrowUpRight size={14} />
          </Link>
        </div>
      )}
    </div>
  )
}

const BasicInfo = () => {
  const indexDTF = useAtomValue(indexDTFAtom)

  return (
    <InfoCard title="Basics">
      <InfoCardItem
        label={t`Name`}
        icon={<IconWrapper Component={Braces} />}
        value={indexDTF?.token.name}
        border={false}
      />
      <InfoCardItem
        label={t`Ticker`}
        icon={<IconWrapper Component={DollarSign} />}
        value={indexDTF?.token.symbol}
      />
      <InfoCardItem
        label={t`Address`}
        icon={<IconWrapper Component={Hash} />}
        address={indexDTF?.id}
        value={indexDTF?.id ? shortenAddress(indexDTF.id) : undefined}
      />
      <InfoCardItem
        label={t`Mandate`}
        icon={<IconWrapper Component={Signature} />}
        bold={false}
        value={indexDTF?.mandate}
      />
      <InfoCardItem
        label={t`Deployer`}
        icon={<IconWrapper Component={Hash} />}
        address={indexDTF?.deployer}
        value={
          indexDTF?.deployer ? shortenAddress(indexDTF.deployer) : undefined
        }
      />
    </InfoCard>
  )
}

const GovernanceTokenInfo = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  if (indexDTF && !indexDTF.stToken) return null

  return (
    <InfoCard title="Governance Token">
      <InfoCardItem
        label={t`Vote-Lock DAO Token`}
        icon={<IconWrapper Component={Hash} />}
        value={indexDTF?.stToken?.token.symbol}
        address={indexDTF?.stToken?.id}
        border={false}
      />
      <InfoCardItem
        label={t`Underlying Token`}
        icon={
          <TokenLogo
            chain={chainId}
            symbol={indexDTF?.stToken?.underlying.symbol}
            address={indexDTF?.stToken?.underlying.address}
            size="xl"
          />
        }
        value={indexDTF?.stToken?.underlying.symbol}
        address={indexDTF?.stToken?.underlying.address}
      />
    </InfoCard>
  )
}

// TODO: Share distribution pending subgraph work!
const FeesInfo = () => {
  const indexDTF = useAtomValue(indexDTFAtom)

  return (
    <InfoCard title={t`Fees & Revenue Distribution`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 bg-secondary">
        <InfoCardItem
          className="bg-card rounded-3xl"
          border={false}
          icon={<IconWrapper Component={TableRowsSplit} />}
          label={t`Annualized TVL Fee`}
          value={
            indexDTF
              ? formatPercentage(indexDTF?.annualizedTvlFee * 100)
              : undefined
          }
        />
        <InfoCardItem
          className="bg-card rounded-3xl"
          border={false}
          icon={<IconWrapper Component={ChartPie} />}
          label={t`Minting Fee`}
          value={
            indexDTF ? formatPercentage(indexDTF?.mintingFee * 100) : undefined
          }
        />
      </div>
    </InfoCard>
  )
}

const GovernanceInfo = ({ basket }: { basket?: boolean }) => {
  const indexDTF = useAtomValue(indexDTFAtom)

  if (
    indexDTF &&
    ((basket && !indexDTF.tradingGovernance) ||
      (!basket && !indexDTF.ownerGovernance))
  )
    return null

  const data = basket ? indexDTF?.tradingGovernance : indexDTF?.ownerGovernance

  return (
    <InfoCard title={basket ? t`Basket Governance` : t`Non-Basket Governance`}>
      <InfoCardItem
        label={t`Governor Address`}
        icon={<IconWrapper Component={Hash} />}
        address={data?.id}
        value={data?.id ? shortenAddress(data.id) : undefined}
        border={false}
      />
      <InfoCardItem
        label={t`Timelock Address`}
        icon={<IconWrapper Component={Hash} />}
        address={data?.timelock.id}
        value={data?.timelock.id ? shortenAddress(data.timelock.id) : undefined}
      />
      <InfoCardItem
        icon={<IconWrapper Component={Pause} />}
        label={t`Voting Delay`}
        value={data ? parseDuration(data.votingDelay) : undefined}
      />
      <InfoCardItem
        icon={<IconWrapper Component={Calendar1} />}
        label={t`Voting Period`}
        value={data ? parseDuration(data.votingPeriod) : undefined}
      />
      <InfoCardItem
        icon={<IconWrapper Component={FileLock2} />}
        label={t`Proposal Threshold`}
        value={
          data
            ? formatPercentage(
                Number(formatEther(BigInt(data.proposalThreshold)))
              )
            : undefined
        }
      />
      <InfoCardItem
        icon={<IconWrapper Component={ShieldCheck} />}
        label={t`Voting Quorum`}
        value={data ? formatPercentage(data.quorumNumerator) : undefined}
      />
      <InfoCardItem
        icon={<IconWrapper Component={MousePointerBan} />}
        label={t`Execution Delay`}
        value={data ? parseDuration(data.timelock.executionDelay) : undefined}
      />
    </InfoCard>
  )
}

const DistributeFees = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { data: receipt, isLoading } = useWaitForTransactionReceipt({
    hash,
    chainId: indexDTF?.chainId,
  })

  if (!indexDTF) return null

  const distributeFees = () => {
    writeContract({
      abi: dtfIndexAbi,
      address: indexDTF.id,
      functionName: 'distributeFees',
      chainId: indexDTF.chainId,
    })
  }

  return (
    <InfoCard title={t`Distribute Fees`} secondary>
      <div className="p-4 flex flex-col gap-4">
        Distribute accumulated fees to the recipients. Anyone can trigger this
        transaction.
        <TransactionButtonContainer
          chain={indexDTF.chainId}
          className="col-span-2"
        >
          <Button
            onClick={distributeFees}
            disabled={isPending || isLoading || receipt?.status === 'success'}
            className="w-full"
          >
            {isPending || isLoading
              ? 'Loading...'
              : receipt?.status === 'success'
                ? 'Fees distributed'
                : 'Distribute Fees'}
          </Button>
        </TransactionButtonContainer>
      </div>
    </InfoCard>
  )
}

const guardiansAtom = atom((get) => {
  const dtf = get(indexDTFAtom)

  if (!dtf) return undefined

  const added = new Set()

  // TODO: Currently we have 2 govs but we handle a single guardian list
  return [
    ...(dtf.ownerGovernance?.timelock.guardians ?? []),
    ...(dtf.tradingGovernance?.timelock.guardians ?? []),
  ].filter((guardian) => {
    if (added.has(guardian)) return false

    added.add(guardian)

    return (
      guardian !== dtf.ownerGovernance?.id &&
      guardian !== dtf.tradingGovernance?.id
    )
  })
})

const RolesInfo = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const guardians = useAtomValue(guardiansAtom)

  return (
    <InfoCard title={t`Roles`} secondary>
      {!indexDTF && (
        <div className="flex items-center p-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="ml-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24 mt-1" />
          </div>
        </div>
      )}
      {guardians?.map((guardian) => (
        <InfoCardItem
          key={guardian}
          label={t`Guardian`}
          icon={<IconWrapper Component={ShieldHalf} />}
          address={guardian}
          value={shortenAddress(guardian)}
        />
      ))}
      {indexDTF?.auctionLaunchers?.map((approver) => (
        <InfoCardItem
          key={approver}
          label={t`Auction Launcher`}
          icon={<IconWrapper Component={MousePointerClick} />}
          address={approver}
          value={shortenAddress(approver)}
        />
      ))}
      {indexDTF?.brandManagers?.map((approver) => (
        <InfoCardItem
          key={approver}
          label={t`Brand Manager`}
          icon={<IconWrapper Component={Image} />}
          address={approver}
          value={shortenAddress(approver)}
        />
      ))}
    </InfoCard>
  )
}

const IndexDTFSettings = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-2 mb-4">
      <div className="flex flex-col gap-2">
        <BasicInfo />
        <GovernanceTokenInfo />
        <FeesInfo />
        <GovernanceInfo basket />
        <GovernanceInfo />
      </div>
      <div className="flex flex-col gap-2">
        <RolesInfo />
        <DistributeFees />
      </div>
    </div>
  )
}

export default IndexDTFSettings
