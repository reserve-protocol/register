import { ConnectWalletButton } from '@/components/ui/transaction'
import { useAccount } from 'wagmi'
import { usePortfolio } from './hooks/use-portfolio'
import { useHistoricalPortfolio } from './hooks/use-historical-portfolio'
import PortfolioSkeleton from './components/portfolio-skeleton'
import PortfolioChart from './components/portfolio-chart'
import PortfolioBreakdown from './components/portfolio-breakdown'
import RewardsAvailable from './components/rewards-available'
import { IndexDTFPositions, YieldDTFPositions } from './components/dtf-positions'
import AvailableRewards from './components/available-rewards'
import StakedPositions from './components/staked-positions'
import VoteLockedPositions from './components/vote-locked-positions'
import ActiveProposals from './components/active-proposals'
import VotingPower from './components/voting-power'
import RSRSection from './components/rsr-section'

const ConnectPrompt = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <h1 className="text-2xl font-bold">Portfolio</h1>
    <p className="text-legend">Connect your wallet to view your portfolio</p>
    <ConnectWalletButton />
  </div>
)

const PortfolioPage = () => {
  const { address } = useAccount()
  const { data, isLoading } = usePortfolio(address)

  // Prefetch all historical periods
  useHistoricalPortfolio(address)

  if (!address) return <ConnectPrompt />
  if (isLoading || !data) return <PortfolioSkeleton />

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
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
      <StakedPositions stakedRSR={data.stakedRSR} />
      <VoteLockedPositions voteLocks={data.voteLocks} />
      <ActiveProposals stakedRSR={data.stakedRSR} voteLocks={data.voteLocks} />
      <VotingPower voteLocks={data.voteLocks} />
      <RSRSection rsrBalances={data.rsrBalances} />
    </div>
  )
}

export default PortfolioPage
