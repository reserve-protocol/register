import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { chainIdAtom } from '@/state/atoms'
import { shortenAddress } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRightIcon, FileText, Folder } from 'lucide-react'
import { Link } from 'react-router-dom'
import { dtfTradesByProposalAtom, TradesByProposal } from '../atoms'
import AuctionList from './auction-list'
import AuctionOverview from './auctions-overview'
import ProposalTradesSkeleton from './proposal-trades-skeleton'

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
        <AuctionList trades={data.trades} />
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
