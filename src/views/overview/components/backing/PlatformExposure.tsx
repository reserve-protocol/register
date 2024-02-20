import { Trans } from '@lingui/macro'
import { Button } from 'components'
import HiperlinkIcon from 'components/icons/HiperlinkIcon'
import LayersIcon from 'components/icons/LayersIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { atom, useAtomValue } from 'jotai'
import Skeleton from 'react-loading-skeleton'
import { collateralsMetadataAtom } from 'state/cms/atoms'
import { rTokenCollateralDetailedAtom } from 'state/rtoken/atoms/rTokenBackingDistributionAtom'
import { Box, Card, Image, Text } from 'theme-ui'

interface PlatformDetails {
  name: string
  distribution: number
  website?: string
  description: string
  logo?: string
}

const dataAtom = atom((get) => {
  const metadata = get(collateralsMetadataAtom)
  const collaterals = get(rTokenCollateralDetailedAtom)

  if (!collaterals || !metadata) {
    return null
  }

  const platformDetails: Record<string, PlatformDetails> = {}

  for (const collateral of collaterals) {
    const meta = metadata[collateral.symbol.toLowerCase().replace('-vault', '')]

    if (meta.protocol) {
      if (platformDetails[meta.protocol.name]) {
        platformDetails[meta.protocol.name].distribution +=
          collateral.distribution
      } else {
        platformDetails[meta.protocol.name] = {
          name: meta.protocol.name,
          distribution: collateral.distribution,
          website: meta.protocol.website,
          description: meta.protocol.description,
          logo: meta.protocol.logo,
        }
      }
    }
  }

  return Object.values(platformDetails)
})

const PlatformExposure = () => {
  const exposure = useAtomValue(dataAtom)

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
      {!exposure && <Skeleton count={3} height={80} />}
      {exposure?.map((data) => (
        <Card
          key={data.name}
          variant="section"
          sx={{ backgroundColor: 'backgroundNested' }}
        >
          <Box variant="layout.verticalAlign">
            <Image src={data.logo} width="24px" height="auto" />
            <Text ml="2" sx={{ color: 'accent' }} variant="bold">
              {data.distribution.toFixed(2)}%
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
