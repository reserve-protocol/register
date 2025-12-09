import { Trans } from '@lingui/macro'
import { cn } from '@/lib/utils'
import AsteriskIcon from 'components/icons/AsteriskIcon'
import RevenueSplitIcon from 'components/icons/RevenueSplitIcon'
import TokenLogo, { CurrentRTokenLogo } from 'components/icons/TokenLogo'
import { atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import { chainIdAtom, rTokenRevenueSplitAtom } from 'state/atoms'
import { shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { Address } from 'viem'

type RevenueType = 'holders' | 'stakers' | 'external'

interface IRevenueBox {
  type: RevenueType
  distribution: number
  address?: Address
  className?: string
}

const RevenueBox = ({
  type,
  distribution,
  address,
  className,
}: IRevenueBox) => {
  const chainId = useAtomValue(chainIdAtom)
  const [title, icon] = useMemo(() => {
    if (type === 'holders') {
      return [<Trans>Shared with RToken Holders</Trans>, <CurrentRTokenLogo />]
    } else if (type === 'stakers') {
      return [
        <Trans>Shared with RSR Stakers</Trans>,
        <TokenLogo symbol="rsr" />,
      ]
    }

    return [<Trans>Shared externally</Trans>, <AsteriskIcon />]
  }, [type])

  return (
    <div
      className={cn(
        'flex items-center p-3 flex-wrap border border-secondary bg-card grow rounded-xl',
        className
      )}
    >
      {icon}
      <div className="ml-3">
        <span className="text-sm block text-legend">{title}</span>
        <span className="font-bold">{distribution.toFixed(2)}%</span>
      </div>
      {type === 'external' && !!address && (
        <a
          href={getExplorerLink(address, chainId, ExplorerDataType.ADDRESS)}
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

const splitDataAtom = atom((get) => {
  const split = get(rTokenRevenueSplitAtom)

  if (!split) {
    return null
  }

  return [
    {
      type: 'holders',
      distribution: +split.holders,
    },
    {
      type: 'stakers',
      distribution: +split.stakers,
    },
    ...split.external.map((external) => ({
      type: 'external',
      distribution: +external.total,
      address: external.address,
    })),
  ] as { type: RevenueType; distribution: number; address?: Address }[]
})

const RevenueSplitOverview = ({ className }: { className?: string }) => {
  const data = useAtomValue(splitDataAtom)

  return (
    <div className={cn('px-4 pb-3', className)}>
      <div className="flex items-center mb-4 text-2xl">
        <RevenueSplitIcon />
        <span className="ml-2 font-semibold">
          <Trans>Revenue distribution</Trans>
        </span>
      </div>
      {!data && <Skeleton height={64} />}
      <div className="flex items-center flex-wrap gap-4">
        {data?.map((item, index) => <RevenueBox key={index} {...item} />)}
      </div>
    </div>
  )
}

export default RevenueSplitOverview
