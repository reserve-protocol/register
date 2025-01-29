import { Asterisk, ChevronDown, ChevronRight } from 'lucide-react'

import WalletOutlineIcon from '@/components/icons/WalletOutlineIcon'
import CopyValue from '@/components/old/button/CopyValue'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BlockiesAvatar from '@/components/utils/blockies-avatar'
import { cn } from '@/lib/utils'
import { shortenAddress } from '@/utils'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ReactNode, useEffect, useRef, useState } from 'react'

interface TokenRowProps {
  icon: string
  amount: string
  value: string
  name: string
  timer?: string
  onCancel?: () => void
  onWithdraw?: () => void
  chevron?: boolean
  performance?: {
    value: string
    chart?: boolean
  }
  price?: string
  estimatedApy?: string
  reward?: string
}

function TokenRow({
  icon,
  amount,
  value,
  name,
  timer,
  onCancel,
  onWithdraw,
  chevron,
  performance,
  price,
  estimatedApy,
  reward,
}: TokenRowProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <img
            src={icon || '/placeholder.svg'}
            alt={name}
            className="rounded-full"
          />
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#0052ff]">{amount}</span>
            <span>{name}</span>
          </div>
          <span className="text-sm text-muted-foreground">${value}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {timer && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{timer}</span>
            <Button
              variant="link"
              className="h-auto p-0 text-sm font-normal text-red-500"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        )}
        {onWithdraw && (
          <Button variant="outline" size="sm" onClick={onWithdraw}>
            Withdraw
          </Button>
        )}
        {chevron && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
        {performance && (
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">24h performance:</span>
                <span className="text-sm text-[#0052ff]">
                  {performance.value}
                </span>
              </div>
              {price && (
                <div className="text-sm text-muted-foreground">
                  Price ${price}
                </div>
              )}
            </div>
            {performance.chart && (
              <svg
                className="h-8 w-16"
                viewBox="0 0 64 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M0 24L16 16L32 20L48 8L64 12"
                  className="text-[#0052ff]"
                />
              </svg>
            )}
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        {estimatedApy && (
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Est APY:</div>
              <div className="font-medium">{estimatedApy}</div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#0052ff]">{reward}</span>
              <Button variant="outline" size="icon" className="h-6 w-6">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  )
}

const PortfolioHeader = () => {
  return (
    <ConnectButton.Custom>
      {({ account, openAccountModal }) => {
        if (!account) return null

        return (
          <div className="flex items-center gap-2 p-6 pb-2 w-full">
            <div className="relative flex items-center gap-2">
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
                <div className="flex items-center rounded-full bg-muted p-1">
                  <CopyValue
                    value={account.address}
                    size={16}
                    placement="right"
                  />
                </div>
                <div
                  className="flex items-center rounded-full border border-red-200 text-red-500 p-1"
                  role="button"
                  onClick={openAccountModal}
                >
                  <Asterisk size={16} />
                </div>
              </div>
            </div>
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

const PortfolioSection = () => {
  return (
    <div className="p-4">
      <h2 className="mb-3 text-base font-bold">Unlocking</h2>
      <TokenRow
        icon="https://v0.blob.com/token-icon.png"
        amount="10.2K"
        name="stAERO"
        value="18.87K"
        onWithdraw={() => {}}
      />
      <TokenRow
        icon="https://v0.blob.com/token-icon.png"
        amount="10.2K"
        name="stAERO"
        value="18.87K"
        timer="2d 32m 3s"
        onCancel={() => {}}
      />
      <TokenRow
        icon="https://v0.blob.com/token-icon.png"
        amount="12M"
        name="hyusdRSR"
        value="150K"
        chevron
        estimatedApy="4.52%"
        reward="+4.45M RSR"
      />
      <TokenRow
        icon="https://v0.blob.com/token-icon.png"
        amount="100.3M"
        name="BIGTOMTOM10"
        value="145.34K"
        performance={{
          value: '+14.23%',
          chart: true,
        }}
        price="304.54"
        chevron
      />
    </div>
  )
}

const PortfolioSummary = () => {
  return (
    <div className="p-6 pt-5 flex flex-col justify-center gap-8 text-primary">
      <WalletOutlineIcon className="h-9 w-9 -ml-[1px] -mt-[1px]" />
      <div className="flex flex-col justify-center gap-4">
        <span className="text-base">Total Reserve holdings</span>
        <span className="text-5xl">$781,100.00</span>
      </div>
    </div>
  )
}

const PortfolioContent = () => {
  const [isSticky, setIsSticky] = useState(false)
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
        defaultValue="all"
        className={cn(
          'sticky top-0 z-10 bg-card transition-all duration-200 pb-2',
          isSticky && 'border-b border-border'
        )}
      >
        <TabsList className="w-full justify-between px-6 py-3 bg-transparent [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:px-0 [&>button]:text-base [&>button]:font-light [&>button]:bg-transparent [&>button]:whitespace-nowrap data-[state=active]:[&>button]:font-bold data-[state=active]:[&>button]:text-primary data-[state=active]:[&>button]:shadow-none">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="vote-locked">Vote locked</TabsTrigger>
          <TabsTrigger value="staked-rsr">Staked RSR</TabsTrigger>
          <TabsTrigger value="index-dtfs">Index DTFs</TabsTrigger>
          <TabsTrigger value="yield-dtfs">Yield DTFs</TabsTrigger>
          <TabsTrigger value="rsr">RSR</TabsTrigger>
        </TabsList>
      </Tabs>
      <div
        className={cn(
          'flex-1 transition-colors duration-200 p-2 [&:not(:last-child)]:[&>div]:border-b',
          isSticky && 'bg-muted/20'
        )}
      >
        <PortfolioSection />
        <PortfolioSection />
      </div>
    </Card>
  )
}

const PortfolioSidebar = ({ children }: { children: ReactNode }) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      {/* target close button and add spacing */}
      <DrawerContent className="first:[&>button]:top-[22px] first:[&>button]:right-[22px]">
        <DrawerTitle className="w-full">
          <PortfolioHeader />
        </DrawerTitle>
        <PortfolioContent />
      </DrawerContent>
    </Drawer>
  )
}

export default PortfolioSidebar
