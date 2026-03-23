import { Trans } from '@lingui/macro'
import { cn } from '@/lib/utils'
import AsteriskIcon from 'components/icons/AsteriskIcon'
import TokenLogo, { CurrentRTokenLogo } from 'components/icons/TokenLogo'
import { useAtomValue } from 'jotai'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { chainIdAtom } from 'state/atoms'
import { shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { Address } from 'viem'
import { RevenueSplit } from 'components/rtoken-setup/atoms'
import Spinner from '@/components/ui/spinner'
import { ProposalCall } from '@/views/yield-dtf/governance/atoms'
import useRevenueDistributionSummary from './use-revenue-distribution-summary'

type RevenueType = 'holders' | 'stakers' | 'external'

interface RevenueBoxProps {
  type: RevenueType
  distribution: number
  address?: string
}

const RevenueBox = ({ type, distribution, address }: RevenueBoxProps) => {
  const chainId = useAtomValue(chainIdAtom)

  const [title, icon] =
    type === 'holders'
      ? [<Trans>RToken Holders</Trans>, <CurrentRTokenLogo />]
      : type === 'stakers'
        ? [<Trans>RSR Stakers</Trans>, <TokenLogo symbol="rsr" />]
        : [<Trans>External</Trans>, <AsteriskIcon />]

  return (
    <div className="flex items-center p-3 flex-wrap border border-secondary bg-card grow rounded-xl">
      {icon}
      <div className="ml-3">
        <span className="text-sm block text-legend">{title}</span>
        <span className="font-bold">{distribution.toFixed(2)}%</span>
      </div>
      {type === 'external' && !!address && (
        <a
          href={getExplorerLink(
            address as Address,
            chainId,
            ExplorerDataType.ADDRESS
          )}
          className="ml-auto flex items-center text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ArrowRight size={14} />
          <span className="mx-2">{shortenAddress(address)}</span>
          <ArrowUpRight size={14} />
        </a>
      )}
    </div>
  )
}

const splitToBoxes = (split: RevenueSplit) => {
  const boxes: RevenueBoxProps[] = [
    { type: 'holders', distribution: +split.holders },
    { type: 'stakers', distribution: +split.stakers },
    ...split.external.map((ext) => ({
      type: 'external' as const,
      distribution: +ext.total,
      address: ext.address,
    })),
  ]
  return boxes
}

const RevenueSection = ({
  label,
  split,
}: {
  label: string
  split: RevenueSplit
}) => {
  const boxes = splitToBoxes(split)

  return (
    <div>
      <span className="text-sm font-medium text-legend mb-2 block">
        {label}
      </span>
      <div className="flex items-center flex-wrap gap-2">
        {boxes.map((box, i) => (
          <RevenueBox key={`${box.type}-${box.address ?? i}`} {...box} />
        ))}
      </div>
    </div>
  )
}

const RevenueDistributionSummary = ({
  calls,
  snapshotBlock,
}: {
  calls: ProposalCall[]
  snapshotBlock?: number
}) => {
  const { data, isLoading } = useRevenueDistributionSummary(
    calls,
    snapshotBlock
  )

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 items-center my-6">
        <Spinner size={20} />
        <span className="text-legend">Loading summary...</span>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="flex flex-col gap-4 mt-2">
      <RevenueSection label="Current" split={data.current} />
      <RevenueSection label="Proposed" split={data.proposed} />
    </div>
  )
}

export default RevenueDistributionSummary
