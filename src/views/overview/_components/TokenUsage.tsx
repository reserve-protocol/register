import { t } from '@lingui/macro'
import { ContentHead, InfoHeading } from 'components/info-box'
import { Box, BoxProps, Flex } from 'theme-ui'
import { TokenStats } from 'types'
import { formatCurrency } from 'utils'

interface Props extends BoxProps {
  metrics: TokenStats
}

const TokenUsage = ({ metrics, ...props }: Props) => (
  <Box {...props}>
    <ContentHead title={t`Usage Stats`} />

    <Flex mt={[4, 7]} mb={-3} sx={{ flexWrap: 'wrap' }}>
      <Box mr={8}>
        <InfoHeading
          title={t`Cumulative Tx Volume`}
          mb={[3, 4]}
          subtitle={metrics.cumulativeVolumeUsd}
        />
        <InfoHeading
          mb={[3, 4]}
          title={t`24h Tx Vol`}
          subtitle={metrics.dailyVolume}
        />
      </Box>
      <Box>
        <InfoHeading
          title={t`Cumulative Txs`}
          mb={[3, 4]}
          mr={5}
          subtitle={formatCurrency(metrics.transferCount)}
        />
        <InfoHeading
          title={t`24h Txs`}
          mb={[3, 4]}
          mr={5}
          subtitle={formatCurrency(metrics.dailyTransferCount)}
        />
      </Box>
    </Flex>
  </Box>
)

export default TokenUsage
