import { Trans } from '@lingui/macro'
import { Button } from 'components'
import CopyValue from 'components/button/CopyValue'
import GoTo from 'components/button/GoTo'
import BluechipLogo from 'components/icons/BluechipIcon'
import CirclesIcon from 'components/icons/CirclesIcon'
import HiperlinkIcon from 'components/icons/HiperlinkIcon'
import LayersIcon from 'components/icons/LayersIcon'
import StackIcon from 'components/icons/StackIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { Box, Card, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import VerticalDivider from 'views/home/components/VerticalDivider'

const mockData = [
  {
    name: 'Compound',
    distribution: 50,
    website: 'https://example.com',
    description: 'eUSD is a stablecoin pegged to the US dollar',
  },
  {
    name: 'AAVE',
    distribution: 50,
    website: 'https://example.com',
    description: 'FRAX is a stablecoin pegged to the US dollar',
  },
]

const PlatformExposure = () => {
  return (
    <Card variant="inner">
      <Box
        variant="layout.verticalAlign"
        p={4}
        sx={{ borderBottom: '1px solid', borderColor: 'border' }}
      >
        <LayersIcon color="currentColor" />
        <Text ml="2" mr="auto" variant="bold" sx={{ fontSize: 3 }}>
          <Trans>Underlying Platform Exposure</Trans>
        </Text>
      </Box>
      {mockData.map((data) => (
        <Card key={data.name} variant="section">
          <Box variant="layout.verticalAlign">
            <TokenLogo symbol={'test'} width={24} />
            <Text ml="2" sx={{ color: 'accent' }} variant="bold">
              {data.distribution}%
            </Text>
            <Text ml="1" variant="bold">
              {data.name}
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
          </Box>
        </Card>
      ))}
    </Card>
  )
}

export default PlatformExposure
