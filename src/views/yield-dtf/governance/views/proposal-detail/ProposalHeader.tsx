import Address from '@/components/utils/explorer-address'
import { Button } from '@/components/ui/button'
import CopyValue from '@/components/ui/copy-value'
import FilesIcon from 'components/icons/FilesIcon'
import FingerprintIcon from 'components/icons/FingerprintIcon'
import WalletOutlineIcon from 'components/icons/WalletOutlineIcon'
import dayjs from 'dayjs'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { shortenString } from 'utils'
import { ROUTES } from 'utils/constants'
import { proposalDetailAtom } from './atom'
import ProposalSnapshot from './ProposalSnapshot'

const BackButton = () => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(`../${ROUTES.GOVERNANCE}`)
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleBack}>
      <div className="flex items-center justify-center py-1">
        <ArrowLeft size={16} />
      </div>
    </Button>
  )
}

const Dot = () => (
  <div className="hidden items-center justify-center font-bold sm:flex">·</div>
)

const StatItem = ({
  label,
  icon,
  children,
}: {
  label: string
  icon: ReactNode
  children: ReactNode
}) => (
  <div className="flex items-center gap-3">
    <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-foreground">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-legend text-xs">{label}</span>
      {children}
    </div>
  </div>
)

const ProposalHeader = () => {
  const rToken = useRToken()
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
    <div className="flex h-full flex-col justify-between gap-4 p-4 sm:gap-7 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-2">
        <BackButton />
        <ProposalSnapshot />
      </div>
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col gap-2 border-b border-border pb-4 sm:pb-6">
          <span className="text-lg font-bold">{title}</span>
          {!!rfcLink && (
            <a
              href={rfcLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <span className="overflow-hidden text-ellipsis font-semibold text-foreground underline">
                {rfcLink}
              </span>
              <ArrowUpRight size={16} />
            </a>
          )}
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col flex-wrap items-start gap-2 sm:flex-row sm:items-center sm:gap-8">
            <StatItem label="Proposed on" icon={<FilesIcon />}>
              <span>
                {proposal?.creationTime
                  ? dayjs.unix(+proposal.creationTime).format('MMM D, YYYY')
                  : 'Loading...'}
              </span>
            </StatItem>
            <StatItem label="Proposed by" icon={<WalletOutlineIcon />}>
              <div>
                {proposal?.proposer && rToken?.chainId && (
                  <Address
                    address={proposal?.proposer}
                    chain={rToken?.chainId}
                  />
                )}
              </div>
            </StatItem>
            <StatItem label="ID" icon={<FingerprintIcon />}>
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
      </div>
    </div>
  )
}
export default ProposalHeader
