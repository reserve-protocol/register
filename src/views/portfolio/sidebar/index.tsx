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
import { formatCurrency, shortenAddress } from '@/utils'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { Token } from '@/types'
import TokenLogo from '@/components/token-logo'
import { formatUnits } from 'viem'
import { useAtomValue } from 'jotai'
import { accountTokenPricesAtom, accountUnclaimedLocksAtom } from '../atoms'
import { ChainId } from '@/utils/chains'

interface TokenRowProps {
  token: Token
  underlying?: Token
  chainId: number
  amount: bigint
}

function TokenRow({ token, chainId, amount, underlying }: TokenRowProps) {
  const prices = useAtomValue(accountTokenPricesAtom)
  const formattedAmount = formatUnits(amount, token.decimals)
  const tokenPrice = prices[underlying?.address ?? token.address]
  const value = tokenPrice ? tokenPrice * Number(formattedAmount) : 0

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-2">
        <TokenLogo
          size="xl"
          address={underlying?.address ?? token.address}
          chain={chainId}
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-[6px] font-bold">
            <span className="text-primary">{formattedAmount}</span>
            <span>{token.name}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ${formatCurrency(value)}
          </span>
        </div>
      </div>
      <div>Action</div>
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

const Unlocking = () => {
  const locks = useAtomValue(accountUnclaimedLocksAtom)
  return (
    <div className="p-4">
      <h2 className="mb-3 text-base font-bold">Unlocking</h2>
      {locks.map((lock) => (
        <TokenRow
          key={lock.lockId}
          token={lock.token}
          chainId={ChainId.Base} // TODO: change
          amount={lock.amount}
          underlying={lock.underlying}
        />
      ))}
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
        <Unlocking />
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
