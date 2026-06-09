import CopyValue from '@/components/ui/copy-value'
import { Button } from '@/components/ui/button'
import ExplorerAddress from '@/components/utils/explorer-address'
import { chainIdAtom } from '@/state/atoms'
import { shortenString } from '@/utils'
import { ROUTES } from '@/utils/constants'
import dayjs from 'dayjs'
import { useAtomValue } from 'jotai'
import {
  ArrowLeft,
  ArrowUpRight,
  Fingerprint,
  ScrollText,
  Wallet,
} from 'lucide-react'
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { proposalDetailAtom } from '../atom'
import { cn } from '@/lib/utils'
import ContestedBadge from '../../../components/contest-badge'
import OptimisticBadge from '../../../components/optimistic-badge'

const BackButton = () => {
  return (
    <Link to={`../${ROUTES.GOVERNANCE}`}>
      <Button variant="outline" size="icon">
        <ArrowLeft size={16} />
      </Button>
    </Link>
  )
}

const StatItem = ({
  label,
  icon,
  children,
  className,
}: {
  className?: string
  label: string
  icon: ReactNode
  children: ReactNode
}) => (
  <div className={cn("flex items-center gap-3", className)}>
    <div className="flex items-center justify-center w-6 h-6 bg-foreground/10 rounded-full text-foreground/90">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-xs md:text-sm text-legend">{label}</span>
      <span className='text-sm md:text-base'>{children}</span>
    </div>
  </div >
)

const ProposalTitle = () => {
  const proposal = useAtomValue(proposalDetailAtom)

  let title = 'Loading...'
  let rfcLink = ''

  if (proposal?.description) {
    const [heading, rfc, _] = proposal.description.split(/\r?\n/)
    title = heading.replaceAll('#', '').trim()
    if (rfc?.includes('forum')) {
      rfcLink = rfc.match(/\(([^)]+)\)/)?.[1] ?? ''
    }
  }

  return (
    <div className="flex flex-col border-b border-border pb-2 md:pb-4 gap-2">
      <h2 className="text-lg md:text-2xl font-semibold">{title}</h2>
      {!!rfcLink && (
        <Link to={rfcLink} target="_blank" className="flex items-center gap-1">
          <span className="text-foreground overflow-ellipsis underline font-semibold">
            {rfcLink}
          </span>
          <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  )
}

const ProposalParams = () => {
  const proposal = useAtomValue(proposalDetailAtom)
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4 md:gap-5">
        <StatItem
          label="Proposed on"
          icon={<ScrollText size={16} strokeWidth={1.5} />}
        >
          <span>
            {proposal?.creationTime
              ? dayjs.unix(+proposal.creationTime).format('MMM D, YYYY')
              : 'Loading...'}
          </span>
        </StatItem>
        <StatItem
          label="Proposed by"
          icon={<Wallet size={16} strokeWidth={1.5} />}
        >
          <div>
            {proposal?.proposer && (
              <ExplorerAddress
                address={proposal?.proposer?.address}
                chain={chainId}
                ens
              />
            )}
          </div>
        </StatItem>
        <StatItem label="ID" className='hidden sm:flex' icon={<Fingerprint size={16} strokeWidth={1.5} />}>
          <div className="flex items-center gap-1">
            <span>
              {proposal?.id ? shortenString(proposal.id) : 'Loading...'}
            </span>
            {!!proposal?.id && (
              <CopyValue text={proposal.id} value={proposal.id} />
            )}
          </div>
        </StatItem>
      </div>
    </div>
  )
}

const ProposalHeader = () => (
  <div className="flex flex-col justify-between gap-3 md:gap-7 p-4 lg:p-6 pb-2 ">
    <div className='flex items-center'>
      <BackButton />
    </div>
    <div className="flex flex-col gap-2 md:gap-4">
      <ProposalTitle />
      <ProposalParams />
    </div>
  </div>
)

export default ProposalHeader
