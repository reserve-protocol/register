import { t } from '@lingui/macro'
import Help from 'components/help'
import MeltIcon from 'components/icons/MeltIcon'
import { useAtomValue } from 'jotai'
import { Circle } from 'react-feather'
import { Box, BoxProps, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { auctionsOverviewAtom } from '../atoms'
import RevenueBoxContainer from './RevenueBoxContainer'

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
    <Box variant="layout.verticalAlign" mx={3} mb={3} sx={{}}>
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
  const data = useAtomValue(auctionsOverviewAtom)

  return (
    <Box p={4}>
      <RevenueOverviewHeader
        text={t`Actionable accumulated revenue`}
        amount={0}
        help="text"
      />
      <RevenueBoxContainer
        title="Melting"
        icon={<MeltIcon />}
        subtitle="other"
        btnLabel="expand"
      >
        tadasdasdasdasodnasd
      </RevenueBoxContainer>
    </Box>
  )
}

export default Revenue
