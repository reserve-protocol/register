import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import Spinner from '@/components/ui/spinner'
import { chainIdAtom } from '@/state/atoms'
import { getCurrentTime, shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import humanizeDuration from 'humanize-duration'
import { useAtomValue } from 'jotai'
import { AlarmClockOff, ArrowUpRightIcon, Check, Folder } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dtfTradesByProposalAtom, TradesByProposal } from '../atoms'
import AuctionList from './auction-list'
import AuctionOverview from './auctions-overview'
import ProposalTradesSkeleton from './proposal-trades-skeleton'
import { Separator } from '@/components/ui/separator'

function getTimerFormat(seconds: number) {
  const timeUnits = {
    days: 'd',
    day: 'd',
    hours: 'h',
    hour: 'h',
    minutes: 'm',
    minute: 'm',
    seconds: 's',
    second: 's',
  }

  let str = humanizeDuration(seconds * 1000, {
    units: ['h', 'm', 's'],
    round: true,
    spacer: '',
    delimiter: ' ',
  })

  // Replace all time unit words with their shortened versions
  for (const [word, short] of Object.entries(timeUnits)) {
    str = str.replace(word, short)
  }

  // Ensure seconds are always shown
  if (!str.includes('s')) {
    str += ' 0s'
  }

  return str
}

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="hidden sm:flex items-center gap-2 text-sm border rounded-full py-2 px-3 font-light mr-4">
      {children}
    </div>
  )
}

const ProposalIndicators = ({ data }: { data: TradesByProposal }) => {
  const [, setSeconds] = useState(0)
  const currentTime = getCurrentTime()
  const expiresAt = data.expiresAt - currentTime
  const availableAt = data.availableAt - currentTime
  const isExpired = expiresAt < 0
  const isAvailable = availableAt < 0

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!isAvailable && !isExpired) {
    return (
      <Container>
        <Spinner />
        Permissionless in:{' '}
        <span className="font-semibold">{getTimerFormat(availableAt)}</span>
      </Container>
    )
  }

  if (!isExpired) {
    return (
      <Container>
        <Spinner />
        Auction expires in:{' '}
        <span className="font-semibold">{getTimerFormat(expiresAt)}</span>
      </Container>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm font-light mr-4">
      <div className="flex items-center gap-1 border-r pr-3">
        <AlarmClockOff size={16} />
        <span className="hidden sm:block">Expired:</span>{' '}
        <span className="text-destructive">{data.expired}</span>
      </div>
      <div className="flex items-center gap-1">
        <Check size={16} />
        <span className="hidden sm:block">Completed:</span>{' '}
        <span className="text-primary">{data.completed}</span>
      </div>
    </div>
  )
}

const ProposalTradeHeader = ({ data }: { data: TradesByProposal }) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
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
      <ProposalIndicators data={data} />
      {/* <Link
        target="_blank"
        className="flex items-center gap-1 text-sm rounded-3xl border p-2 mr-4"
        to={`../${ROUTES.GOVERNANCE_PROPOSAL}/${data.proposal.id}`}
      >
        <FileText size={16} strokeWidth={1.5} />
        View proposal
        <ArrowUpRightIcon size={14} />
      </Link> */}
    </div>
  )
}

const ProposalTradeItem = ({ data }: { data: TradesByProposal }) => {
  return (
    <AccordionItem
      value={data.proposal.id}
      className="rounded-3xl bg-card m-1 border-none"
    >
      <AccordionTrigger className="bg-background rounded-3xl p-4">
        <ProposalTradeHeader data={data} />
      </AccordionTrigger>
      <AccordionContent>
        <AuctionList trades={data.trades} proposalId={data.proposal.id} />
      </AccordionContent>
    </AccordionItem>
  )
}

const ProposalTradesList = () => {
  const tradesByProposal = useAtomValue(dtfTradesByProposalAtom)

  return (
    <Accordion
      className="bg-secondary rounded-3xl h-fit"
      type="single"
      collapsible
    >
      {tradesByProposal?.map((value) => (
        <ProposalTradeItem key={value.proposal.id} data={value} />
      ))}
    </Accordion>
  )
}

const ProposalTrades = () => {
  const tradesByProposal = useAtomValue(dtfTradesByProposalAtom)

  if (!tradesByProposal || tradesByProposal.length === 0)
    return <ProposalTradesSkeleton loading={!tradesByProposal} />

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-2 ml-2 lg:ml-0 mr-2 mb-5">
      <ProposalTradesList />
      <AuctionOverview />
    </div>
  )
}

export default ProposalTrades
