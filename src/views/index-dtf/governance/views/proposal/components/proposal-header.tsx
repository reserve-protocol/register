import { Button } from '@/components/ui/button'
import CopyValue from '@/components/ui/copy-value'
import ExplorerAddress from '@/components/utils/explorer-address'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { shortenString } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { useLingui } from '@lingui/react/macro'
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
  <div className={cn('flex items-center gap-3', className)}>
    <div className="flex items-center justify-center w-6 h-6 bg-foreground/10 rounded-full text-foreground/90">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-xs md:text-sm text-legend">{label}</span>
      <span className="text-sm md:text-base">{children}</span>
    </div>
  </div>
)

const ProposalTitle = () => {
  const { t } = useLingui()
  const proposal = useAtomValue(proposalDetailAtom)

  let title = t`Loading...`
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
  const { t } = useLingui()
  const proposal = useAtomValue(proposalDetailAtom)
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4 md:gap-5">
        <StatItem
          label={t`Proposed on`}
          icon={<ScrollText size={16} strokeWidth={1.5} />}
        >
          <span>
            {proposal?.creationTime
              ? dayjs.unix(+proposal.creationTime).format('MMM D, YYYY')
              : t`Loading...`}
          </span>
        </StatItem>
        <StatItem
          label={t`Proposed by`}
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
        <StatItem
          label={t`ID`}
          className="hidden sm:flex"
          icon={<Fingerprint size={16} strokeWidth={1.5} />}
        >
          <div className="flex items-center gap-1">
            <span>{proposal?.id ? shortenString(proposal.id) : t`Loading...`}</span>
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
    <div className="flex items-center">
      <BackButton />
    </div>
    <div className="flex flex-col gap-2 md:gap-4">
      <ProposalTitle />
      <ProposalParams />
    </div>
  </div>
)

export default ProposalHeader
