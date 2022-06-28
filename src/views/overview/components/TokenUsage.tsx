import { t } from '@lingui/macro'
import { ContentHead, InfoHeading } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { rTokenAtom } from 'state/atoms'
import { Box, BoxProps, Grid } from 'theme-ui'

const TokenUsage = (props: BoxProps) => {
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
        <InfoHeading title={t`Avg 24h Tx Vol`} subtitle="$20,456,789" />
        <InfoHeading title={t`Average 24h Txs`} subtitle="10,000" />
        <InfoHeading
          title={t`Cumulative Tx Volume`}
          subtitle="$20,123,456,789"
        />
        <InfoHeading title={t`Cumulative Txs`} subtitle="25,000,000" />
      </Grid>
    </Box>
  )
}

export default TokenUsage
