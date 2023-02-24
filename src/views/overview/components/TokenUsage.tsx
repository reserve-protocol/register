import { t } from '@lingui/macro'
import { InfoHeading, ContentHead } from 'components/info-box'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { TokenStats } from 'types'
import { formatCurrency } from 'utils'

interface Props extends BoxProps {
  metrics: TokenStats
}

const TokenUsage = ({ metrics, ...props }: Props) => {
  return (
    <Box {...props}>
      <ContentHead title={t`Usage Stats`} />
      <Flex mt={5} sx={{ flexWrap: 'wrap' }} mb={-4}>
        <InfoHeading
          title={t`Cumulative Tx Volume`}
          mb={4}
          mr={5}
          subtitle={metrics.cumulativeVolumeUsd}
        />
        <InfoHeading
          mb={4}
          mr={5}
          title={t`24h Tx Vol`}
          subtitle={metrics.dailyVolume}
        />
        <InfoHeading
          title={t`Cumulative Txs`}
          mb={4}
          mr={5}
          subtitle={formatCurrency(metrics.transferCount)}
        />
        <InfoHeading
          title={t`24h Txs`}
          mb={4}
          mr={5}
          subtitle={formatCurrency(metrics.dailyTransferCount)}
        />
      </Flex>
    </Box>
  )
}

export default TokenUsage
