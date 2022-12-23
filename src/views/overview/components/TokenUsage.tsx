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
      <Flex mt={5} mb={2} sx={{ flexWrap: 'wrap' }}>
        <Box mr={6}>
          <InfoHeading
            title={t`Cumulative Tx Volume`}
            mb={4}
            subtitle={metrics.cumulativeVolumeUsd}
          />
          <InfoHeading
            mb={4}
            title={t`24h Tx Vol`}
            subtitle={metrics.dailyVolume}
          />
        </Box>
        <Box>
          <InfoHeading
            title={t`Cumulative Txs`}
            mb={4}
            subtitle={formatCurrency(metrics.transferCount)}
          />
          <InfoHeading
            title={t`24h Txs`}
            mb={4}
            subtitle={formatCurrency(metrics.dailyTransferCount)}
          />
        </Box>
      </Flex>
    </Box>
  )
}

export default TokenUsage
