import { t } from '@lingui/macro'
import { ContentHead, InfoHeading } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { rTokenAtom } from 'state/atoms'
import { Box, BoxProps, Grid } from 'theme-ui'
import { TokenStats } from 'types'
import { formatCurrency } from 'utils'

interface Props extends BoxProps {
  metrics: TokenStats
}

const TokenUsage = ({ metrics, ...props }: Props) => {
  const rToken = useAtomValue(rTokenAtom)

  return (
    <Box {...props}>
      <ContentHead
        title={t`${rToken?.symbol} Usage stats`}
        subtitle={
          !!rToken?.isRSV
            ? t`Including off-chain in-app transactions of RSV in the Reserve App.`
            : undefined
        }
      />
      <Grid columns={2} mt={4} gap={4}>
        <InfoHeading title={t`24h Tx Vol`} subtitle="$0" />
        <InfoHeading title={t`24h Txs`} subtitle="0" />
        <InfoHeading
          title={t`Cumulative Tx Volume`}
          subtitle={metrics.cumulativeVolumeUsd}
        />
        <InfoHeading
          title={t`Cumulative Txs`}
          subtitle={formatCurrency(metrics.transferCount)}
        />
      </Grid>
    </Box>
  )
}

export default TokenUsage
