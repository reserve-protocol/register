import { Button } from 'components'
import TokenLogo from 'components/icons/TokenLogo'
import { useAtomValue } from 'jotai'
import Skeleton from 'react-loading-skeleton'
import { tokenMetadataAtom } from 'state/cms/atoms'
import { Box, Grid, Text } from 'theme-ui'

const PoolTokenDetails = ({
  tokens,
}: {
  tokens: { address: string; symbol: string; logo: string }[]
}) => {
  const tokensMeta = useAtomValue(tokenMetadataAtom)

  return (
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
        <Box key={token.address} p="4">
          <Box
            variant="layout.verticalAlign"
            mb="2"
            sx={{ fontSize: 3, fontWeight: 500, gap: 2 }}
          >
            <TokenLogo width={24} symbol={token.symbol} src={token.logo} />
            {tokensMeta ? (
              tokensMeta[token.symbol.toLowerCase()]?.name ?? ''
            ) : (
              <Skeleton width={120} />
            )}
            <Text variant="legend">({token.symbol})</Text>
          </Box>
          {!tokensMeta ? (
            <Skeleton count={5} style={{ marginTop: 8 }} />
          ) : (
            <>
              <Text as="p" variant="legend">
                {tokensMeta[token.symbol.toLowerCase()]?.description ??
                  'No description available'}
              </Text>

              {tokensMeta[token.symbol.toLowerCase()]?.website && (
                <Button
                  onClick={() =>
                    window.open(
                      tokensMeta[token.symbol.toLowerCase()].website,
                      '_blank'
                    )
                  }
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
      ))}
    </Grid>
  )
}

export default PoolTokenDetails
