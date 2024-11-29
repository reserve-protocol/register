import { Button } from 'components'
import TokenLogo from 'components/icons/TokenLogo'
import { useAtomValue } from 'jotai'
import Skeleton from 'react-loading-skeleton'
import { tokenMetadataAtom } from 'state/cms/atoms'
import { Box, Grid, Text } from 'theme-ui'

type PoolToken = { address: string; symbol: string; logo: string }

const TokenDetail = ({ token }: { token: PoolToken }) => {
  const tokensMeta = useAtomValue(tokenMetadataAtom)
  const isLoading = !tokensMeta
  const data = tokensMeta?.[token.symbol.toLowerCase()]

  return (
    <Box p="4">
      <Box
        variant="layout.verticalAlign"
        mb="2"
        sx={{ fontSize: 3, fontWeight: 500, gap: 2 }}
      >
        <TokenLogo width={24} symbol={token.symbol} src={token.logo} />
        {!isLoading ? data?.name ?? '' : <Skeleton width={120} />}
        <Text variant="legend">({token.symbol})</Text>
      </Box>
      {isLoading ? (
        <Skeleton count={5} style={{ marginTop: 8 }} />
      ) : (
        <>
          <Text as="p" sx={{ lineHeight: 1.2 }} variant="legend">
            {data?.description ?? 'No description available'}
          </Text>

          {data?.website && (
            <Button
              onClick={() => window.open(data.website, '_blank')}
              mt="3"
              variant="transparent"
              small
            >
              Website
            </Button>
          )}
        </>
      )}
    </Box>
  )
}

const PoolTokenDetails = ({ tokens }: { tokens: PoolToken[] }) => (
  <Grid
    columns={Math.min(3, tokens.length)}
    gap={2}
    sx={{
      borderBottom: '1px solid',
      borderColor: 'border',
      '&>div': {
        borderRight: '1px solid',
        borderColor: 'border',
      },
      '&>div:last-child': {
        borderRight: 'none',
      },
    }}
  >
    {tokens.map((token) => (
      <TokenDetail key={token.address} token={token} />
    ))}
  </Grid>
)

export default PoolTokenDetails
