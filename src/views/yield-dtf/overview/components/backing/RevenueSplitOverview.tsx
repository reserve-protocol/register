import { Trans } from '@lingui/macro'
import AsteriskIcon from 'components/icons/AsteriskIcon'
import RevenueSplitIcon from 'components/icons/RevenueSplitIcon'
import TokenLogo, { CurrentRTokenLogo } from 'components/icons/TokenLogo'
import { atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import { chainIdAtom, rTokenRevenueSplitAtom } from 'state/atoms'
import { borderRadius } from 'theme'
import { Box, BoxProps, Link, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { Address } from 'viem'

type RevenueType = 'holders' | 'stakers' | 'external'

interface IRevenueBox extends BoxProps {
  type: RevenueType
  distribution: number
  address?: Address
}

const RevenueBox = ({ type, distribution, address, ...props }: IRevenueBox) => {
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
    <Box
      variant="layout.verticalAlign"
      p="3"
      sx={{
        flexWrap: 'wrap',
        border: '1px solid',
        borderColor: 'border',
        flexGrow: 1,
        borderRadius: borderRadius.boxes,
      }}
      {...props}
    >
      {icon}
      <Box ml="3">
        <Text sx={{ fontSize: 1, display: 'block' }} variant="legend">
          {title}
        </Text>
        <Text variant="bold">{distribution.toFixed(2)}%</Text>
      </Box>
      {type === 'external' && !!address && (
        <Link
          href={getExplorerLink(address, chainId, ExplorerDataType.ADDRESS)}
          ml="auto"
          target="_blank"
          sx={{ color: 'text', fontSize: 1 }}
          variant="layout.verticalAlign"
        >
          <ArrowRight size={14} />
          <Text mx="2">{shortenAddress(address)}</Text>
          <ArrowUpRight size={14} />
        </Link>
      )}
    </Box>
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

const RevenueSplitOverview = (props: BoxProps) => {
  const data = useAtomValue(splitDataAtom)

  return (
    <Box px={4} pb={3} {...props}>
      <Box variant="layout.verticalAlign" mb="4" sx={{ fontSize: 4 }}>
        <RevenueSplitIcon />
        <Text ml="2" variant="bold">
          <Trans>Revenue distribution</Trans>
        </Text>
      </Box>
      {!data && <Skeleton height={64} />}
      <Box variant="layout.verticalAlign" sx={{ flexWrap: 'wrap', gap: 4 }}>
        {data?.map((item, index) => <RevenueBox key={index} {...item} />)}
      </Box>
    </Box>
  )
}

export default RevenueSplitOverview
