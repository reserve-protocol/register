import { t, Trans } from '@lingui/macro'
import { ContentHead, InfoHeading } from 'components/info-box'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from 'state/atoms'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { TokenStats } from 'types'
import { formatCurrency } from 'utils'
import { EUSD_ADDRESS } from 'utils/addresses'

interface Props extends BoxProps {
  metrics: TokenStats
}

const TokenUsage = ({ metrics, ...props }: Props) => {
  const rToken = useRToken()
  const chainId = useAtomValue(chainIdAtom)

  return (
    <Box {...props}>
      <ContentHead title={t`Usage Stats`} />
      {rToken?.address === EUSD_ADDRESS[chainId] && (
        <Text variant="legend">
          <Trans>eUSD usage includes off-chain data from Rpay</Trans>
        </Text>
      )}

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
}

export default TokenUsage
