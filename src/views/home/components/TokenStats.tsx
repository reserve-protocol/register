import { t } from '@lingui/macro'
import { ContentHead, InfoHeading } from 'components/info-box'
import { Box, Text, Flex, Grid } from 'theme-ui'

const Stat = ({ title, value }: { title: string; value: string }) => (
  <Box mt={3} mr={3}>
    <Text sx={{ whiteSpace: 'nowrap' }} variant="legend">
      {title}
    </Text>{' '}
    <Text sx={{ color: 'boldText' }}>{value}</Text>
  </Box>
)

const TokenStats = () => {
  return (
    <Box>
      <ContentHead
        title={t`RToken stats`}
        subtitle={t`These stats are aggregated across all RTokens on the Reserve Protocol that are supported by this dApp. This also includes anonymized data from the Reserve App API if RTokens are supported by RPay to give insights into total currency usage.`}
      />
      <Box
        mt={5}
        pl={5}
        sx={(theme: any) => ({
          borderLeft: '1px solid',
          borderColor: theme.colors.border,
        })}
      >
        <Grid columns={2} gap={4}>
          <InfoHeading
            title={t`Total RToken Market Cap`}
            subtitle="$20,456,789"
          />
          <InfoHeading
            title={t`Cumalitive - RToken holder income`}
            subtitle="$10,000"
          />
          <InfoHeading title={t`TVL in Reserve`} subtitle="$20,123,456,789" />
          <InfoHeading
            title={t`Cumalitive - Staked RSR ***`}
            subtitle="$25,000,000"
          />
        </Grid>
        <Flex mt={2} sx={{ flexWrap: 'wrap' }}>
          <Stat title={t`Avg 24h Tx Vol`} value="$20,456,789" />
          <Stat title={t`Cumulative Tx Volume`} value="$20,123,456,789" />
          <Stat title={t`Average 24h Txs`} value="10,000" />
          <Stat title={t`Cumulative Txs`} value="25,000,000" />
        </Flex>
      </Box>
    </Box>
  )
}

export default TokenStats
