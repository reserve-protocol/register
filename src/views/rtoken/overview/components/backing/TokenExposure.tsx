import { Trans } from '@lingui/macro'
import { Button } from 'components'
import CopyValue from '@/components/old/button/CopyValue'
import GoTo from '@/components/old/button/GoTo'
import BluechipLogo from 'components/icons/BluechipIcon'
import CirclesIcon from 'components/icons/CirclesIcon'
import HiperlinkIcon from 'components/icons/HiperlinkIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { atom, useAtomValue } from 'jotai'
import Skeleton from 'react-loading-skeleton'
import { chainIdAtom } from 'state/atoms'
import { collateralsMetadataAtom } from 'state/cms/atoms'
import { rTokenCollateralDetailedAtom } from 'state/rtoken/atoms/rTokenBackingDistributionAtom'
import { Box, Card, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import VerticalDivider from 'views/compare/components/VerticalDivider'

interface TokenExposure {
  symbol: string
  distribution: number
  rating?: string
  address: string
  chain: number
  website?: string
  description: string
}

const dataAtom = atom((get) => {
  const metadata = get(collateralsMetadataAtom)
  const chainId = get(chainIdAtom)
  const collaterals = get(rTokenCollateralDetailedAtom)

  if (!collaterals || !metadata) {
    return null
  }

  const tokenDetails: Record<string, TokenExposure> = {}

  for (const collateral of collaterals) {
    const meta = metadata[collateral.symbol.toLowerCase().replace('-vault', '')]
    const tokens = meta?.underlying
    const distribution = meta?.tokenDistribution ?? []

    // token distribution
    if (distribution.length) {
      for (const dist of distribution) {
        const token = tokens[dist.token]

        if (token) {
          if (tokenDetails[token.symbol]) {
            tokenDetails[token.symbol].distribution +=
              dist.distribution * collateral.distribution
          } else {
            tokenDetails[token.symbol] = {
              symbol: token.symbol,
              distribution: dist.distribution * collateral.distribution,
              rating: token.rating,
              address: token.addresses[chainId],
              chain: chainId,
              website: token.website,
              description: token.description,
            }
          }
        }
      }
    } else if (tokens && Object.keys(tokens).length) {
      const token = tokens[Object.keys(tokens)[0]]
      tokenDetails[token.symbol] = {
        symbol: token.symbol,
        distribution: collateral.distribution * 100,
        rating: token.rating,
        address: token.addresses[chainId],
        chain: chainId,
        website: token.website,
        description: token.description,
      }
    }
  }

  return Object.values(tokenDetails)
})

const TokenExposure = () => {
  const data = useAtomValue(dataAtom)

  return (
    <Card variant="inner">
      <Box
        variant="layout.verticalAlign"
        p={[3, 4]}
        sx={{ borderBottom: '1px solid', borderColor: 'border' }}
      >
        <CirclesIcon color="currentColor" />
        <Text ml="2" mr="auto" variant="bold" sx={{ fontSize: 3 }}>
          <Trans>Underlying Token Exposure</Trans>
        </Text>
      </Box>
      {!data && <Skeleton count={3} height={80} />}
      {data?.map((data) => (
        <Card
          key={data.symbol}
          variant="section"
          p={[3, 4]}
          sx={{ backgroundColor: 'backgroundNested' }}
        >
          <Box variant="layout.verticalAlign">
            <TokenLogo symbol={data.symbol} width={24} />
            <Text ml="2" sx={{ color: 'accent' }} variant="bold">
              {data.distribution.toFixed(2)}%
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
            {!!data.address && (
              <Box
                variant="layout.verticalAlign"
                sx={{ flexBasis: ['100%', 'auto'], mt: [3, 0] }}
              >
                <Text mr={2} variant="legend">
                  {!!data.address && shortenAddress(data.address)}
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
            )}
          </Box>
        </Card>
      ))}
    </Card>
  )
}

export default TokenExposure
