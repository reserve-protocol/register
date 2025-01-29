import { Button } from '@/components/ui/button'
import {
  AssetTrade,
  dtfTradesByProposalAtom,
  TradesByProposal,
  tradeVolatilityAtom,
} from '../atoms'

import TokenLogo from '@/components/token-logo'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'
import { chainIdAtom } from '@/state/atoms'
import { formatPercentage, shortenAddress } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtom, useAtomValue } from 'jotai'
import {
  ArrowRight,
  ArrowUpRightIcon,
  FileText,
  Folder,
  Square,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'

const LaunchTradesButton = () => {
  return <Button className="w-full">Launch trades</Button>
}

const LaunchTradesPanel = () => {
  return (
    <div className="flex flex-col gap-2 p-2 bg-secondary rounded-3xl h-fit">
      <div className="bg-card p-2 rounded-xl">
        <LaunchTradesButton />
      </div>

      <p className="text-sm text-muted-foreground">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
      </p>
    </div>
  )
}

const Share = ({
  share,
  prefix,
}: {
  share: number | undefined
  prefix?: string
}) => {
  if (!share) return <Skeleton className="h-8 w-14" />

  return (
    <h4 className="font-bold text-2xl">
      {prefix}
      {formatPercentage(share)}
    </h4>
  )
}

const ShareRange = ({
  from,
  to,
}: {
  from: number | undefined
  to: number | undefined
}) => {
  if (!from || !to) return <Skeleton className="h-8 w-14" />

  return (
    <span className="text-xs whitespace-nowrap">
      from {formatPercentage(from)} to {formatPercentage(to)}
    </span>
  )
}

const VOLATILITY_OPTIONS = ['Low', 'Medium', 'High']

const ProposedTradeVolatility = ({ index }: { index: number }) => {
  const [volatility, setVolatility] = useAtom(tradeVolatilityAtom)

  return (
    <div className="border rounded-xl p-0 sm:p-1">
      <ToggleGroup
        type="single"
        className="bg-muted-foreground/10 p-1 rounded-xl text-sm"
        value={volatility[index]?.toString() || '0'}
        onValueChange={(value) => {
          // setVolatility((prev) => {
          //   const newVolatility = [...prev]
          //   newVolatility[index] = Number(value)
          //   return newVolatility
          // })
        }}
      >
        {VOLATILITY_OPTIONS.map((option, index) => (
          <ToggleGroupItem
            key={option}
            value={index.toString()}
            className="px-1 sm:px-2 h-8 whitespace-nowrap rounded-lg data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary"
          >
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

const TradePreview = ({ trade }: { trade: AssetTrade }) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center w-full sm:w-80 mr-auto">
      <div className="flex flex-col gap-1">
        <span>Sell ${trade.sell.symbol}</span>
        <div className="flex items-center gap-1">
          <TokenLogo address={trade.sell.address} chain={chainId} size="lg" />
          <Share share={trade.deltaSellShare} />
        </div>
        <ShareRange from={trade.currentSellShare} to={trade.sellShare} />
      </div>
      <div className="bg-muted rounded-full p-1 text-legend">
        <ArrowRight size={18} />
      </div>
      <div className="flex flex-col gap-1 items-end">
        <span>Buy ${trade.buy.symbol}</span>
        <div className="flex items-center gap-1">
          <Share share={trade.deltaBuyShare} prefix="+" />
          <TokenLogo address={trade.buy.address} chain={chainId} size="lg" />
        </div>
        <ShareRange from={trade.currentBuyShare} to={trade.buyShare} />
      </div>
    </div>
  )
}

const TradeButton = ({
  trade,
  className,
}: {
  trade: AssetTrade
  className?: string
}) => {
  return (
    <Button className={cn('sm:py-7 gap-1', className)}>
      <Square size={16} className="relative" /> Launch
    </Button>
  )
}

const TradeItem = ({ trade }: { trade: AssetTrade }) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border">
      <div className="flex items-center flex-grow flex-wrap gap-2">
        <TradePreview trade={trade} />
        <div className="flex items-center gap-2 w-full md:w-auto">
          <ProposedTradeVolatility index={0} />
          <TradeButton className="ml-auto flex sm:hidden" trade={trade} />
        </div>
      </div>
      <TradeButton trade={trade} className="hidden sm:flex flex-shrink-0" />
    </div>
  )
}

const TradesHeader = ({ trades }: { trades: AssetTrade[] }) => {
  return (
    <div className="flex items-center">
      <h2 className="font-bold text-base ml-3 mr-auto">
        All trades in proposal
      </h2>
      <Button className="text-primary gap-1" variant="ghost-accent">
        <Square size={16} className="relative -top-[1px]" />
        Select all
      </Button>
    </div>
  )
}

const Trades = ({ trades }: { trades: AssetTrade[] }) => {
  return (
    <div className="flex flex-col gap-2 bg-card p-2 md:p-4 rounded-3xl">
      <TradesHeader trades={trades} />
      {trades.map((trade) => (
        <TradeItem key={trade.id} trade={trade} />
      ))}
    </div>
  )
}

const ProposalTradeItem = ({ data }: { data: TradesByProposal }) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <AccordionItem
      value={data.proposal.id}
      className="rounded-3xl bg-card m-1 border-none"
    >
      <AccordionTrigger className="bg-background rounded-3xl p-4">
        <div className="flex items-center gap-2 w-full">
          <div className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center rounded-full">
            <Folder size={16} />
          </div>
          <div className="text-left mr-auto">
            <span className="block">Proposed by:</span>
            <Link
              to={getExplorerLink(
                data.proposal.proposer.address,
                chainId,
                ExplorerDataType.ADDRESS
              )}
              target="_blank"
              className="flex items-center gap-2 text-primary"
            >
              {shortenAddress(data.proposal.proposer.address)}
              <div className="bg-primary/10 rounded-full p-1">
                <ArrowUpRightIcon size={14} />
              </div>
            </Link>
          </div>
          <Link
            target="_blank"
            className="flex items-center gap-1 text-sm rounded-3xl border p-2 mr-4"
            to={`../${ROUTES.GOVERNANCE_PROPOSAL}/${data.proposal.id}`}
          >
            <FileText size={16} strokeWidth={1.5} />
            View proposal
            <ArrowUpRightIcon size={14} />
          </Link>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <Trades trades={data.trades} />
      </AccordionContent>
    </AccordionItem>
  )
}

const ProposalTradesList = () => {
  const tradesByProposal = useAtomValue(dtfTradesByProposalAtom)

  if (!tradesByProposal) return <Skeleton className="h-14" />

  return (
    <Accordion
      className="bg-secondary rounded-3xl h-fit"
      type="single"
      collapsible
    >
      {tradesByProposal.map((value) => (
        <ProposalTradeItem key={value.proposal.id} data={value} />
      ))}
    </Accordion>
  )
}

const ProposalTrades = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-2 ml-2 lg:ml-0 mr-2">
      <ProposalTradesList />
      <LaunchTradesPanel />
    </div>
  )
}

export default ProposalTrades
