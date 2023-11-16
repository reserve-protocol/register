import { t } from '@lingui/macro'
import Help from 'components/help'
import MeltIcon from 'components/icons/MeltIcon'
import { useAtomValue } from 'jotai'
import { Check, Circle } from 'react-feather'
import { Box, BoxProps, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { auctionsOverviewAtom } from '../atoms'
import RevenueBoxContainer from './RevenueBoxContainer'
import { CheckmarkIcon } from 'react-hot-toast'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import useRToken from 'hooks/useRToken'

interface RevenueOverviewHeader {
  text: string
  help: string
  amount: number
  muted?: boolean
}

const RevenueOverviewHeader = ({
  text,
  amount,
  help,
  muted,
}: RevenueOverviewHeader) => {
  return (
    <Box
      variant="layout.verticalAlign"
      mx={3}
      mb={3}
      sx={{ color: 'secondaryText' }}
    >
      <Circle
        size={8}
        fill={!muted ? '#11BB8D' : '#666666'}
        stroke={undefined}
      />
      <Text ml="2">{text}</Text>
      <Text variant="strong" ml="auto" mr="2">
        ${formatCurrency(amount)}
      </Text>
      <Help content={help} />
    </Box>
  )
}

const Revenue = () => {
  const rToken = useRToken()
  const revenueData = useAtomValue(auctionsOverviewAtom)

  return (
    <Box p={4} sx={{ overflow: 'auto' }}>
      <RevenueOverviewHeader
        text={t`Actionable accumulated revenue`}
        amount={
          revenueData
            ? revenueData.availableAuctionRevenue + revenueData.pendingToMelt
            : 0
        }
        help="text"
      />
      <RevenueBoxContainer
        title={t`Melting`}
        icon={<MeltIcon />}
        loading={!revenueData}
        subtitle={t`${formatCurrency(revenueData?.pendingToMelt ?? 0)} of ${
          rToken?.symbol ?? 'rToken'
        }`}
        btnLabel="expand"
        mb={3}
      >
        tadasdasdasdasodnasd
      </RevenueBoxContainer>
      <RevenueBoxContainer
        title={t`Settleable auctions`}
        icon={<Check />}
        subtitle="other"
        btnLabel="expand"
        mb={3}
      >
        tadasdasdasdasodnasd
      </RevenueBoxContainer>
      <RevenueBoxContainer
        title={t`Auctionable revenue`}
        icon={<AuctionsIcon />}
        subtitle="other"
        btnLabel="expand"
        mb={3}
      >
        tadasdasdasdasodnasd
      </RevenueBoxContainer>
      <RevenueBoxContainer
        title={t`Claimable emissions`}
        icon={<AuctionsIcon />}
        subtitle="other"
        btnLabel="expand"
        mb={4}
      >
        tadasdasdasdasodnasd
      </RevenueBoxContainer>
      <RevenueOverviewHeader
        text={t`Unactionable revenue/revenue sources`}
        amount={0}
        muted
        help="text"
      />
      <RevenueBoxContainer
        title={t`Revenue below min trade size`}
        icon={<AuctionsIcon />}
        subtitle="other"
        btnLabel="expand"
        mb={4}
      >
        tadasdasdasdasodnasd
      </RevenueBoxContainer>
    </Box>
  )
}

export default Revenue
