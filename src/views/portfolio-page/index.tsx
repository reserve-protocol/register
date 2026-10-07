import { Button } from '@/components/ui/button'
import { MigrationPreviewCard } from '@/components/vote-lock/migration-preview/migration-preview-card'
import {
  migrationPreviewTargetKey,
  useMigrationPreviewMode,
  useMigrationPreviewStep,
} from '@/components/vote-lock/migration-preview/preview-state'
import {
  migrationPreviewAddress,
  migrationPreviewLegacyVoteLock,
  migrationPreviewPortfolio,
  migrationPreviewPortfolioAtStep,
} from '@/components/vote-lock/migration-preview/preview-portfolio-data'
import Copy from '@/components/ui/copy'
import { shortenAddress } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { Trans } from '@lingui/react/macro'
import { useSetAtom } from 'jotai'
import { Binoculars, Eye, Landmark, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { isAddress } from 'viem'
import { useAccount } from 'wagmi'
import { portfolioAddressAtom, portfolioDataAtom } from './atoms'
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
import PortfolioConnectButton from './components/portfolio-connect-button'
import Transactions from './components/transactions'
import VotingPower from './components/voting-power'
import { usePortfolio } from './hooks/use-portfolio'
import { usePortfolioNow } from './hooks/use-portfolio-now'
import { hasReserveActivity } from './utils'

const ConnectPrompt = () => (
  <div
    data-testid="portfolio-connect-prompt"
    className="container mx-auto flex min-h-[calc(100vh-96px)] items-center justify-center px-4 py-10"
  >
    <div className="flex w-full max-w-[560px] flex-col items-center text-center">
      <h1 className="text-[2rem] font-semibold leading-9 text-primary dark:text-foreground md:text-5xl md:leading-[56px]">
        <Trans>Connect your wallet to view your portfolio</Trans>
      </h1>
      <p className="mt-4 max-w-[500px] text-base leading-6 text-legend md:text-lg">
        <Trans>
          Your portfolio brings together DTF holdings, staked and vote-locked
          governance positions, rewards, pending withdrawals, voting power, RSR
          balances, and recent transactions.
        </Trans>
      </p>

      <div className="mt-8">
        <PortfolioConnectButton />
      </div>
    </div>
  </div>
)

const EmptyPortfolioPrompt = () => (
  <div className="container mx-auto flex min-h-[calc(100vh-96px)] items-center justify-center px-4 py-10">
    <div className="flex w-full max-w-[560px] flex-col items-center text-center">
      <h1 className="text-[2rem] font-semibold leading-9 text-primary dark:text-foreground md:text-5xl md:leading-[56px]">
        <Trans>No Reserve activity found in this wallet</Trans>
      </h1>
      <p className="mt-4 max-w-[500px] text-base leading-6 text-legend md:text-lg">
        <Trans>
          This wallet does not currently hold any DTFs, staked RSR, vote-locked
          positions, rewards, pending withdrawals, or active governance
          activity.
        </Trans>
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Button asChild className="gap-2 rounded-full px-5">
          <Link to={ROUTES.DISCOVER}>
            <Binoculars size={16} strokeWidth={1.5} />
            <Trans>Explore DTFs</Trans>
          </Link>
        </Button>
        <Button asChild variant="outline" className="gap-2 rounded-full px-5">
          <Link to={ROUTES.EARN}>
            <Landmark size={16} strokeWidth={1.5} />
            <Trans>Participate and earn</Trans>
          </Link>
        </Button>
      </div>
    </div>
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
        <p className="text-sm font-medium text-primary">
          <Trans>Viewing portfolio of</Trans>
        </p>
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
      <Trans>Clear</Trans>
    </button>
  </div>
)

const PortfolioPage = () => {
  const migrationPreview = useMigrationPreviewMode()
  const { address: connectedAddress } = useAccount()
  const [searchParams, setSearchParams] = useSearchParams()
  const isAffectedPreview =
    migrationPreview === 'affected' && !searchParams.get('account')
  const accountParam = searchParams.get('account')

  const impersonatedAddress =
    accountParam &&
    isAddress(accountParam) &&
    accountParam.toLowerCase() !== connectedAddress?.toLowerCase()
      ? accountParam
      : undefined

  const address = isAffectedPreview
    ? migrationPreviewAddress
    : impersonatedAddress || connectedAddress
  const migrationTargetKey = migrationPreviewTargetKey(
    migrationPreviewLegacyVoteLock.chainId,
    migrationPreviewLegacyVoteLock.stTokenAddress
  )
  const [migrationStep] = useMigrationPreviewStep(migrationTargetKey)
  const [migrationOpen, setMigrationOpen] = useState(false)
  const openMigration = useCallback(() => setMigrationOpen(true), [])
  const {
    data: fetchedData,
    isLoading,
    isError,
    refetch,
  } = usePortfolio(
    address,
    isAffectedPreview ? migrationPreviewPortfolio : undefined
  )
  const data = useMemo(
    () =>
      isAffectedPreview
        ? migrationPreviewPortfolioAtStep(migrationStep)
        : fetchedData,
    [fetchedData, isAffectedPreview, migrationStep]
  )
  const setPortfolioData = useSetAtom(portfolioDataAtom)
  const setPortfolioAddress = useSetAtom(portfolioAddressAtom)

  usePortfolioNow()

  useEffect(() => {
    setPortfolioData(data ?? null)
    setPortfolioAddress(address)
    return () => {
      setPortfolioData(null)
      setPortfolioAddress(undefined)
    }
  }, [data, address, setPortfolioData, setPortfolioAddress])

  if (!address) return <ConnectPrompt />
  if (isError)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold">
          <Trans>Portfolio</Trans>
        </h1>
        <p className="text-legend">
          <Trans>Failed to load portfolio data</Trans>
        </p>
        <Button
          onClick={() => refetch()}
          className="h-auto rounded-2xl px-6 py-2 text-sm font-medium"
        >
          <Trans>Try again</Trans>
        </Button>
      </div>
    )
  if (isLoading || !data)
    return <PortfolioSkeleton isImpersonating={!!impersonatedAddress} />
  if (!hasReserveActivity(data)) {
    if (!impersonatedAddress) return <EmptyPortfolioPrompt />
    // Keep the impersonation banner (and its exit control) even when the
    // impersonated wallet has no activity.
    return (
      <div className="container mx-auto px-4 pt-6">
        <ImpersonationBanner
          address={impersonatedAddress}
          onClear={() => {
            searchParams.delete('account')
            setSearchParams(searchParams)
          }}
        />
        <EmptyPortfolioPrompt />
      </div>
    )
  }

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
      {!impersonatedAddress &&
        isAffectedPreview &&
        (migrationStep !== 3 || migrationOpen) && (
          <MigrationPreviewCard
            mode="affected"
            targetKey={migrationTargetKey}
            tokenSymbol={migrationPreviewLegacyVoteLock.underlying.symbol}
            voteLockSymbol={migrationPreviewLegacyVoteLock.symbol}
            layout="banner"
            hideWhenComplete
            open={migrationOpen}
            onOpenChange={setMigrationOpen}
          />
        )}
      {/* Top section: Chart + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <PortfolioChart />
        <div className="space-y-4">
          <PortfolioBreakdown />
          <RewardsAvailable />
        </div>
      </div>

      {/* Sections */}
      <IndexDTFPositions />
      <YieldDTFPositions />
      <AvailableRewards />
      <PendingWithdrawals />
      <StakedPositions />
      <VoteLockedPositions onMigrationOpen={openMigration} />
      <ActiveProposals />
      <VotingPower />
      <RSRSection />
      <Transactions />
    </div>
  )
}

export default PortfolioPage
