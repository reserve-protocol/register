import { ChevronDown, ChevronRight, Copy, Sparkle } from 'lucide-react'

import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

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

const PortfolioContent = () => {
  return (
    <Card className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b p-4">
        <Avatar className="h-8 w-8 bg-orange-100">
          <span className="text-orange-500">🐱</span>
        </Avatar>
        <div className="flex items-center gap-2">
          <span className="font-medium">0xd3Cd...9785</span>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Sparkle className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative ml-1 h-2 w-2">
          <div className="absolute h-full w-full animate-ping rounded-full bg-green-500" />
          <div className="absolute h-full w-full rounded-full bg-green-500" />
        </div>
      </div>
      <div className="border-b p-6">
        <img
          src="https://v0.blob.com/tree-blue.png"
          alt="Tree icon"
          className="mb-4 h-8 w-8"
        />
        <div className="mb-2 text-lg">Total Reserve holdings</div>
        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-4xl font-medium text-[#0052ff]">
            $781,100.00
          </span>
          <span className="text-[#0052ff]">4.54%</span>
          <span className="text-sm text-muted-foreground">(+$0.00)</span>
          <span className="text-sm text-muted-foreground">Last 7d</span>
        </div>
        <Tabs defaultValue="all">
          <TabsList className="w-full justify-start gap-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="vote-locked">Vote locked</TabsTrigger>
            <TabsTrigger value="staked-rsr">Staked RSR</TabsTrigger>
            <TabsTrigger value="index-dtfs">Index DTFs</TabsTrigger>
            <TabsTrigger value="yield-dtfs">Yield DTFs</TabsTrigger>
            <TabsTrigger value="rsr">RSR</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="border-b p-4">
          <h2 className="mb-2 text-lg font-semibold">Unlocking</h2>
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
        </div>
        <div className="border-b p-4">
          <h2 className="mb-2 text-lg font-semibold">Staked RSR</h2>
          <TokenRow
            icon="https://v0.blob.com/token-icon.png"
            amount="12M"
            name="hyusdRSR"
            value="150K"
            chevron
            estimatedApy="4.52%"
            reward="+4.45M RSR"
          />
        </div>
        <div className="p-4">
          <h2 className="mb-2 text-lg font-semibold">Index DTFs</h2>
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
      </div>
    </Card>
  )
}

const PortfolioSidebar = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          Open
          <ChevronRight className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="flex gap-2 mt-2 px-2 mb-2">Title</DrawerTitle>
        <PortfolioContent />
        <DrawerFooter className="flex-grow justify-end mb-2">
          Footer
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default PortfolioSidebar
