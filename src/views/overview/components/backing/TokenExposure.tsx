import { Trans } from '@lingui/macro'
import { Button } from 'components'
import CopyValue from 'components/button/CopyValue'
import GoTo from 'components/button/GoTo'
import BluechipLogo from 'components/icons/BluechipIcon'
import CirclesIcon from 'components/icons/CirclesIcon'
import HiperlinkIcon from 'components/icons/HiperlinkIcon'
import TokenLogo from 'components/icons/TokenLogo'
import chain from 'state/chain'
import { Box, Card, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import VerticalDivider from 'views/home/components/VerticalDivider'

const mockData = [
  {
    symbol: 'eUSD',
    distribution: 50,
    rating: 'A',
    address: '0x12345',
    chain: 1,
    website: 'https://example.com',
    description: 'eUSD is a stablecoin pegged to the US dollar',
  },
  {
    symbol: 'FRAX',
    distribution: 25,
    rating: 'F',
    address: '0x12346',
    chain: 1,
    website: 'https://example.com',
    description: 'FRAX is a stablecoin pegged to the US dollar',
  },
  {
    symbol: 'USDC',
    distribution: 25,
    rating: 'B',
    address: '0x12347',
    chain: 1,
    website: 'https://example.com',
    description: 'USDC is a stablecoin pegged to the US dollar',
  },
]

const TokenExposure = () => {
  return (
    <Card variant="inner">
      <Box
        variant="layout.verticalAlign"
        p={4}
        sx={{ borderBottom: '1px solid', borderColor: 'border' }}
      >
        <CirclesIcon color="currentColor" />
        <Text ml="2" mr="auto" variant="bold" sx={{ fontSize: 3 }}>
          <Trans>Underlying Token Exposure</Trans>
        </Text>
      </Box>
      {mockData.map((data) => (
        <Card key={data.address} variant="section">
          <Box variant="layout.verticalAlign">
            <TokenLogo symbol={data.symbol} width={24} />
            <Text ml="2" sx={{ color: 'accent' }} variant="bold">
              {data.distribution}%
            </Text>
            <Text ml="1" variant="bold">
              {data.symbol}
            </Text>
          </Box>
          <Text mt="3" variant="legend" as="p">
            {data.description}
          </Text>
          <Box mt="3" variant="layout.verticalAlign" sx={{ flexWrap: 'wrap' }}>
            <Button
              small
              variant="bordered"
              onClick={() => window.open(data.website, '_blank')}
            >
              <Box variant="layout.verticalAlign">
                <HiperlinkIcon />
                <Text ml="2">Website</Text>
              </Box>
            </Button>
            {!!data.rating && (
              <Button
                small
                ml="3"
                variant="bordered"
                onClick={() => window.open('https://bluechip.org/', '_blank')}
              >
                <Box variant="layout.verticalAlign">
                  <BluechipLogo />
                  <Text variant="bold" ml="2">
                    Rating:
                  </Text>
                  <Text ml="1" sx={{ color: 'accent' }} variant="bold">
                    {data.rating}
                  </Text>
                </Box>
              </Button>
            )}
            <VerticalDivider mx="3" sx={{ display: ['none', 'block'] }} />
            <Box
              variant="layout.verticalAlign"
              sx={{ flexBasis: ['100%', 'auto'], mt: [3, 0] }}
            >
              <Text mr={2} variant="legend">
                {shortenAddress(data.address)}
              </Text>
              <CopyValue mr={1} ml="auto" value={data.address} />
              <GoTo
                style={{ position: 'relative', top: '2px' }}
                href={getExplorerLink(
                  data.address,
                  data.chain,
                  ExplorerDataType.TOKEN
                )}
              />
            </Box>
          </Box>
        </Card>
      ))}
    </Card>
  )
}

export default TokenExposure
