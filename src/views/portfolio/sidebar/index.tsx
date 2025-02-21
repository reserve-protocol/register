import { ArrowLeft, Loader, Power, RefreshCw, Menu } from 'lucide-react'

import ChainLogo from '@/components/icons/ChainLogo'
import WalletOutlineIcon from '@/components/icons/WalletOutlineIcon'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Copy from '@/components/ui/copy'
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BlockiesAvatar from '@/components/utils/blockies-avatar'
import { cn } from '@/lib/utils'
import { accountTokensAtom, chainIdAtom, rsrPriceAtom } from '@/state/atoms'
import { Token } from '@/types'
import {
  formatCurrency,
  formatTokenAmount,
  getFolioRoute,
  getTokenRoute,
  parseDurationShort,
  shortenAddress,
} from '@/utils'
import { RSR_ADDRESS } from '@/utils/addresses'
import { ROUTES } from '@/utils/constants'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Address, formatUnits } from 'viem'
import {
  accountIndexTokensAtom,
  accountRewardsAtom,
  accountStakingTokensAtom,
  accountTokenPricesAtom,
  accountUnclaimedLocksAtom,
  portfolioLastUpdatedAtom,
  portfolioRefreshFnAtom,
  portfolioShowRewardsAtom,
  portfolioSidebarOpenAtom,
  rsrBalancesAtom,
  selectedPortfolioTabAtom,
  totalAccountHoldingsAtom,
} from '../atoms'
import {
  ClaimAllButton,
  IndexDTFAction,
  RewardAction,
  StakeRSRAction,
  UnlockAction,
  VoteLockAction,
  YieldDTFAction,
} from './components/actions'
import humanizeDuration from 'humanize-duration'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const portfolioDismissibleAtom = atom(true)

interface TokenRowProps {
  children?: ReactNode
  token: Token
  chainId: number
  usdPrice?: number
  usdAmount?: number
  underlying?: Token
  amount?: bigint
  amountInt?: number
  onClick?: () => void
  className?: string
}

function TokenRow({
  children,
  token,
  chainId,
  amount,
  amountInt,
  underlying,
  usdPrice,
  usdAmount,
  onClick,
  className,
}: TokenRowProps) {
  const prices = useAtomValue(accountTokenPricesAtom)
  const _amount = amountInt || Number(formatUnits(amount ?? 0n, token.decimals))
  const formattedAmount = formatTokenAmount(_amount)

  const tokenPrice = usdPrice || prices[underlying?.address ?? token.address]

  const value = usdAmount || (tokenPrice ? tokenPrice * _amount : 0)

  return (
    <div
      className={cn(
        'flex items-center justify-between py-4',
        className,
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <div className="relative flex-shrink-0">
          <TokenLogo
            size="xl"
            symbol={underlying?.symbol ?? token.symbol}
            address={underlying?.address ?? token.address}
            chain={chainId}
          />
          <div className="absolute right-0 bottom-0">
            <ChainLogo chain={chainId} fontSize={12} />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-[6px] font-bold">
            <span className="text-primary">{formattedAmount}</span>
            <span className="text-ellipsis">{token.symbol}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            $
            {formatCurrency(value, 2, {
              notation: 'compact',
              compactDisplay: 'short',
            })}
          </span>
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}

const PortfolioRefresher = () => {
  const lastUpdated = useAtomValue(portfolioLastUpdatedAtom)
  const refreshFn = useAtomValue(portfolioRefreshFnAtom)
  const [elapsed, setElapsed] = useState(
    Math.floor((Date.now() - lastUpdated) / 1000)
  )
  const [loading, setLoading] = useState(true) // Initialize as true

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - lastUpdated) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [lastUpdated])

  useEffect(() => {
    refreshFn?.()
    // Set initial loading state
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }, [refreshFn])

  const handleRefresh = () => {
    setLoading(true)
    refreshFn?.()
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2 flex-row-reverse sm:flex-row">
      <div className="text-sm text-muted-foreground">
        {loading ? (
          <Skeleton className="h-5 w-24 bg-muted animate-pulse rounded" />
        ) : (
          <span className="font-light text-sm text-muted-foreground">
            Updated{' '}
            <span className="font-semibold min-w-[17px] inline-block text-center">
              {' '}
              {parseDurationShort(elapsed)
                .replaceAll(' ', '')
                .replaceAll(',', ' ')}
            </span>{' '}
            ago
          </span>
        )}
      </div>
      {loading ? (
        <Button
          size="sm"
          className="h-8 px-2 rounded-xl cursor-not-allowed hover:bg-inherit"
          variant="outline"
        >
          <Loader size={16} className="animate-spin-slow" />
        </Button>
      ) : (
        <Button
          size="sm"
          className="h-8 px-2 gap-2 text-legend rounded-xl disabled:pointer-events-auto disabled:cursor-not-allowed"
          variant="outline"
          onClick={handleRefresh}
        >
          <RefreshCw size={16} />
        </Button>
      )}
    </div>
  )
}

const PortfolioHeader = () => {
  return (
    <ConnectButton.Custom>
      {({ account, openAccountModal, accountModalOpen }) => {
        const [showRewards, setShowRewards] = useAtom(portfolioShowRewardsAtom)
        const setDismissible = useSetAtom(portfolioDismissibleAtom)

        if (!account) return null

        useEffect(() => {
          if (!accountModalOpen) {
            setDismissible(true)
          }
        }, [accountModalOpen])

        const handleAccountModal = () => {
          setDismissible(false)
          document.body.style.pointerEvents = 'auto'
          openAccountModal()
        }

        return (
          <div className="flex items-center gap-6 p-6 pt-[22px] pb-2 justify-between flex-wrap mr-9">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center gap-2">
                {showRewards && (
                  <Button
                    variant="outline"
                    className="rounded-xl px-2 h-9 animate-width-expand"
                    onClick={() => setShowRewards(false)}
                  >
                    <ArrowLeft size={20} strokeWidth={1.5} />
                  </Button>
                )}
                <BlockiesAvatar
                  size={32}
                  address={account.address}
                  className="rounded-[10px]"
                />
                <div className="absolute right-0 bottom-0 translate-x-0.5 translate-y-0.5">
                  <div className="relative ml-1 h-[10px] w-[10px]">
                    <div className="absolute h-full w-full animate-ping rounded-full bg-green-400" />
                    <div className="absolute h-full w-full rounded-full bg-green-400" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-light">
                  {shortenAddress(account.address)}
                </span>
                <div className="flex items-center gap-[6px]">
                  <div className="flex items-center rounded-full bg-muted p-1.5 hover:bg-gray-500/20 transition-colors duration-200">
                    <Copy value={account.address} size={12} side="bottom" />
                  </div>
                  <div
                    className="flex items-center rounded-full border p-1 border-red-50 text-red-500 bg-red-50 hover:bg-red-500/20 transition-colors duration-200"
                    role="button"
                    onClick={handleAccountModal}
                  >
                    <Power size={14} />
                  </div>
                </div>
              </div>
            </div>
            <PortfolioRefresher />
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

const PortfolioSummary = () => {
  const totalAccountHoldings = useAtomValue(totalAccountHoldingsAtom)

  return (
    <div className="p-6 pt-5 flex flex-col justify-center gap-3 sm:gap-8 text-primary">
      <WalletOutlineIcon className="h-9 w-9 -ml-[1px] -mt-[1px]" />
      <div className="flex flex-col justify-center gap-4">
        <span className="text-base">Total Reserve holdings</span>
        <span className="text-5xl">
          ${formatCurrency(totalAccountHoldings)}
        </span>
      </div>
    </div>
  )
}

const VoteLocked = () => {
  const stTokens = useAtomValue(accountStakingTokensAtom)
  const selectedTab = useAtomValue(selectedPortfolioTabAtom)
  const setShowRewards = useSetAtom(portfolioShowRewardsAtom)
  const accountRewards = useAtomValue(accountRewardsAtom)

  if (!stTokens.length || !['all', 'vote-locked'].includes(selectedTab))
    return null

  return (
    <div className="p-4">
      <h2 className="mb-3 text-base font-bold">Vote Locked</h2>
      {stTokens.map((stToken) => (
        <TokenRow
          key={stToken.address}
          token={stToken}
          chainId={stToken.chainId}
          amount={stToken.amount}
          underlying={stToken.underlying}
          onClick={
            !!accountRewards[stToken.address]?.length
              ? () => setShowRewards(true)
              : undefined
          }
        >
          {!!accountRewards[stToken.address]?.length && (
            <VoteLockAction
              stToken={stToken.address}
              chainId={stToken.chainId}
            />
          )}
        </TokenRow>
      ))}
    </div>
  )
}

const Unlocking = () => {
  const locks = useAtomValue(accountUnclaimedLocksAtom)
  const selectedTab = useAtomValue(selectedPortfolioTabAtom)

  if (!locks.length || !['all', 'vote-locked'].includes(selectedTab))
    return null

  return (
    <div className="p-4">
      <h2 className="mb-3 text-base font-bold">Unlocking</h2>
      {locks.map((lock) => (
        <TokenRow
          key={`${lock.token.address}-${lock.lockId}-${lock.chainId}`}
          token={lock.token}
          chainId={lock.chainId}
          amount={lock.amount}
          underlying={lock.underlying}
        >
          <UnlockAction {...lock} />
        </TokenRow>
      ))}
    </div>
  )
}

const IndexDTFs = () => {
  const navigate = useNavigate()
  const indexDTFs = useAtomValue(accountIndexTokensAtom)
  const selectedTab = useAtomValue(selectedPortfolioTabAtom)

  if (!indexDTFs.length || !['all', 'index-dtfs'].includes(selectedTab))
    return null

  return (
    <div className="p-4">
      <h2 className="mb-3 text-base font-bold">Index DTFs</h2>
      {indexDTFs.map((token) => (
        <TokenRow
          key={token.address}
          token={token}
          chainId={token.chainId}
          amount={token.amount}
          onClick={() => navigate(getFolioRoute(token.address, token.chainId))}
        >
          <IndexDTFAction indexDTFAddress={token.address} />
        </TokenRow>
      ))}
    </div>
  )
}

const YieldDTFs = () => {
  const navigate = useNavigate()
  const yieldDTFs = useAtomValue(accountTokensAtom)
  const selectedTab = useAtomValue(selectedPortfolioTabAtom)

  const filteredYieldDTFs = useMemo(
    () => yieldDTFs.filter(({ usdAmount }) => usdAmount > 0.01),
    [yieldDTFs]
  )

  if (!filteredYieldDTFs.length || !['all', 'yield-dtfs'].includes(selectedTab))
    return null

  return (
    <div className="p-4">
      <h2 className="mb-3 text-base font-bold">Yield DTFs</h2>
      {filteredYieldDTFs.map((token) => (
        <TokenRow
          key={token.address}
          token={{
            address: token.address as Address,
            name: token.name,
            symbol: token.symbol,
            decimals: 18,
          }}
          chainId={token.chain}
          amountInt={token.balance}
          usdPrice={token.usdPrice}
          usdAmount={token.usdAmount}
          onClick={() => navigate(getTokenRoute(token.address, token.chain))}
        >
          <YieldDTFAction yieldDTFUsdPrice={token.usdPrice} />
        </TokenRow>
      ))}
    </div>
  )
}

const StakedRSR = () => {
  const navigate = useNavigate()
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const yieldDTFs = useAtomValue(accountTokensAtom)
  const selectedTab = useAtomValue(selectedPortfolioTabAtom)

  const filteredYieldDTFs = useMemo(
    () => yieldDTFs.filter(({ stakedRSR }) => stakedRSR > 1),
    [yieldDTFs]
  )

  if (!filteredYieldDTFs.length || !['all', 'staked-rsr'].includes(selectedTab))
    return null

  return (
    <div className="p-4">
      <h2 className="mb-3 text-base font-bold">Staked RSR</h2>
      {filteredYieldDTFs.map((token) => (
        <TokenRow
          key={token.address}
          token={{
            address: token.address as Address,
            name: `${token.name?.toLowerCase()} RSR`,
            symbol: `${token.symbol?.toLowerCase()}RSR`,
            decimals: 18,
          }}
          chainId={token.chain}
          amountInt={token.stakedRSR}
          usdPrice={rsrPrice || 0}
          usdAmount={token.stakedRSRUsd}
          onClick={() =>
            navigate(getTokenRoute(token.address, token.chain, ROUTES.STAKING))
          }
        >
          <StakeRSRAction />
        </TokenRow>
      ))}
    </div>
  )
}

const RSR = () => {
  const currentChainId = useAtomValue(chainIdAtom)
  const selectedTab = useAtomValue(selectedPortfolioTabAtom)
  const rsrBalances = useAtomValue(rsrBalancesAtom)

  const token = {
    symbol: 'RSR',
    name: 'Reserve Rights',
    decimals: 18,
  }

  if (!rsrBalances || !['all', 'rsr'].includes(selectedTab)) return null

  return (
    <div className="p-4">
      <h2 className="mb-3 text-base font-bold">RSR</h2>
      {Object.entries(RSR_ADDRESS).map(([chainId]) => (
        <TokenRow
          key={chainId}
          token={{ address: RSR_ADDRESS[currentChainId], ...token }} // TODO: use currentChainId to hack rsrPrice
          chainId={Number(chainId)}
          amount={(rsrBalances[Number(chainId)] as bigint) ?? 0n}
        />
      ))}
    </div>
  )
}

export type PortfolioTabs =
  | 'all'
  | 'vote-locked'
  | 'staked-rsr'
  | 'index-dtfs'
  | 'yield-dtfs'
  | 'rsr'

const PORTFOLIO_TABS: { value: PortfolioTabs; label: string }[] = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: 'vote-locked',
    label: 'Vote locked',
  },
  {
    value: 'staked-rsr',
    label: 'Staked RSR',
  },
  {
    value: 'index-dtfs',
    label: 'Index DTFs',
  },
  {
    value: 'yield-dtfs',
    label: 'Yield DTFs',
  },
  {
    value: 'rsr',
    label: 'RSR',
  },
]

const PortfolioContent = () => {
  const [selectedTab, setSelectedTab] = useAtom(selectedPortfolioTabAtom)
  const [isSticky, setIsSticky] = useState(false)
  // hack for rainbow wallet modal
  const observerTarget = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => {
        setIsSticky(!e.isIntersecting)
      },
      { threshold: [1], rootMargin: '-1px 0px 0px 0px' }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <Card className="flex h-full w-full flex-col overflow-auto">
      <PortfolioSummary />
      <div ref={observerTarget} className="h-[1px] w-full" />
      <Tabs
        value={selectedTab}
        onValueChange={(tab) => setSelectedTab(tab as PortfolioTabs)}
        className={cn(
          'sticky top-0 z-10 bg-card transition-all duration-200 pb-2',
          isSticky && 'border-b border-border'
        )}
      >
        {/* Mobile Menu */}
        <div className="md:hidden px-6 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span>
                  {
                    PORTFOLIO_TABS.find((tab) => tab.value === selectedTab)
                      ?.label
                  }
                </span>
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[200px]">
              {PORTFOLIO_TABS.map(({ label, value }) => (
                <DropdownMenuItem
                  key={value}
                  className={cn(
                    'cursor-pointer focus:bg-primary/10',
                    selectedTab === value && 'bg-primary/10 font-bold'
                  )}
                  onClick={() => setSelectedTab(value as PortfolioTabs)}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:block">
          <TabsList className="w-full justify-between px-6 py-3 bg-transparent [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:px-0 [&>button]:text-base [&>button]:font-light [&>button]:bg-transparent [&>button]:whitespace-nowrap data-[state=active]:[&>button]:font-bold data-[state=active]:[&>button]:text-primary data-[state=active]:[&>button]:shadow-none">
            {PORTFOLIO_TABS.map(({ label, value }) => (
              <TabsTrigger value={value} key={value}>
                <span className="text-sm md:text-base">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>
      <div
        className={cn(
          'flex-1 transition-colors duration-200 p-2 [&:not(:last-child)]:[&>div]:border-b first:[&>div]:-mt-2',
          isSticky && 'bg-muted/20'
        )}
      >
        <Unlocking />
        <VoteLocked />
        <StakedRSR />
        <IndexDTFs />
        <YieldDTFs />
        <RSR />
      </div>
    </Card>
  )
}

const PortfolioRewardsContent = () => {
  const accountStTokens = useAtomValue(accountStakingTokensAtom)
  const accountRewards = useAtomValue(accountRewardsAtom)

  const stTokensWithRewards = accountStTokens
    .filter((stToken) => accountRewards[stToken.address]?.length > 0)
    .map((stToken) => ({
      ...stToken,
      rewards: accountRewards[stToken.address],
    }))

  return (
    <Card className="flex h-full w-full flex-col overflow-auto p-4">
      {stTokensWithRewards.map((stToken) => {
        return (
          <div key={stToken.address} className="mb-6 border-b pb-4">
            <TokenRow
              key={stToken.address}
              token={stToken}
              chainId={stToken.chainId}
              amount={stToken.amount}
              underlying={stToken.underlying}
              className="[&>div]:flex-col [&>div]:items-start p-2 text-xl items-end mb-1.5"
            >
              <ClaimAllButton
                stTokenAddress={stToken.address}
                rewards={stToken.rewards}
              />
            </TokenRow>
            {stToken.rewards.map((reward, idx) => (
              <TokenRow
                key={idx}
                token={reward}
                amount={reward.accrued}
                chainId={reward.chainId}
                usdAmount={reward.accruedUSD}
                className="p-2"
              >
                <RewardAction
                  stTokenAddress={stToken.address}
                  reward={reward}
                />
              </TokenRow>
            ))}
          </div>
        )
      })}
    </Card>
  )
}

const PortfolioSidebar = ({ children }: { children: ReactNode }) => {
  const setSelectedTab = useSetAtom(selectedPortfolioTabAtom)
  const dismissible = useAtomValue(portfolioDismissibleAtom)
  const showRewards = useAtomValue(portfolioShowRewardsAtom)
  const [open, setOpen] = useAtom(portfolioSidebarOpenAtom)

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      onClose={() => {
        setSelectedTab('all')
        setOpen(false)
      }}
      dismissible={dismissible}
    >
      <DrawerTrigger asChild onClick={() => setOpen(true)}>
        {children}
      </DrawerTrigger>
      <DrawerContent className="first:[&>button]:top-[22px] first:[&>button]:right-[22px] first:[&>button]:h-8 first:[&>button]:w-8">
        <DrawerTitle className="w-full">
          <PortfolioHeader />
        </DrawerTitle>
        {showRewards ? <PortfolioRewardsContent /> : <PortfolioContent />}
      </DrawerContent>
    </Drawer>
  )
}

export default PortfolioSidebar
