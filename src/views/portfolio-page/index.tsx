import Copy from '@/components/ui/copy'
import { ConnectWalletButton } from '@/components/ui/transaction'
import { shortenAddress } from '@/utils'
import { Eye, X } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isAddress } from 'viem'
import { useAccount } from 'wagmi'
import AvailableRewards from './components/available-rewards'
import ActiveProposals from './components/active-proposals'
import {
  IndexDTFPositions,
  YieldDTFPositions,
} from './components/dtf-positions'
import PortfolioBreakdown from './components/portfolio-breakdown'
import PortfolioChart from './components/portfolio-chart'
import PortfolioSkeleton from './components/portfolio-skeleton'
import RewardsAvailable from './components/rewards-available'
import RSRSection from './components/rsr-section'
import StakedPositions from './components/staked-positions'
import VoteLockedPositions from './components/vote-locked-positions'
import PendingWithdrawals from './components/pending-withdrawals'
import VotingPower from './components/voting-power'
import { useHistoricalPortfolio } from './hooks/use-historical-portfolio'
import { usePortfolio } from './hooks/use-portfolio'

const ConnectPrompt = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <h1 className="text-2xl font-bold">Portfolio</h1>
    <p className="text-legend">Connect your wallet to view your portfolio</p>
    <ConnectWalletButton />
  </div>
)

const ImpersonationBanner = ({
  address,
  onClear,
}: {
  address: string
  onClear: () => void
}) => (
  <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
    <div className="flex items-center gap-2 min-w-0">
      <Eye size={16} className="text-primary flex-shrink-0" />
      <div className="min-w-0 sm:flex sm:items-center sm:gap-2">
        <p className="text-sm font-medium text-primary">Viewing portfolio of</p>
        <div className="flex items-center gap-1">
          <span className="text-sm font-mono truncate">
            {shortenAddress(address)}
          </span>
          <Copy value={address} />
        </div>
      </div>
    </div>
    <button
      onClick={onClear}
      className="flex items-center gap-1 text-sm text-legend hover:text-primary flex-shrink-0"
    >
      <X size={14} />
      Clear
    </button>
  </div>
)

const PortfolioPage = () => {
  const { address: connectedAddress } = useAccount()
  const [searchParams, setSearchParams] = useSearchParams()
  const accountParam = searchParams.get('account')

  const impersonatedAddress = useMemo(
    () =>
      accountParam &&
      isAddress(accountParam) &&
      accountParam.toLowerCase() !== connectedAddress?.toLowerCase()
        ? accountParam
        : undefined,
    [accountParam, connectedAddress]
  )

  const address = impersonatedAddress || connectedAddress
  const { data, isLoading } = usePortfolio(address)

  // Prefetch all historical periods
  useHistoricalPortfolio(address)

  if (!address) return <ConnectPrompt />
  if (isLoading || !data)
    return <PortfolioSkeleton isImpersonating={!!impersonatedAddress} />

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {impersonatedAddress && (
        <ImpersonationBanner
          address={impersonatedAddress}
          onClear={() => {
            searchParams.delete('account')
            setSearchParams(searchParams)
          }}
        />
      )}
      {/* Top section: Chart + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <PortfolioChart data={data} address={address} />
        <div className="space-y-4">
          <PortfolioBreakdown data={data} />
          <RewardsAvailable voteLocks={data.voteLocks} />
        </div>
      </div>

      {/* Sections */}
      <IndexDTFPositions data={data.indexDTFs} />
      <YieldDTFPositions data={data.yieldDTFs} />
      <AvailableRewards voteLocks={data.voteLocks} />
      <PendingWithdrawals stakedRSR={data.stakedRSR} voteLocks={data.voteLocks} />
      <StakedPositions stakedRSR={data.stakedRSR} />
      <VoteLockedPositions voteLocks={data.voteLocks} />
      <ActiveProposals stakedRSR={data.stakedRSR} voteLocks={data.voteLocks} />
      <VotingPower voteLocks={data.voteLocks} stakedRSR={data.stakedRSR} />
      <RSRSection rsrBalances={data.rsrBalances} />
    </div>
  )
}

export default PortfolioPage
