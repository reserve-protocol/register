import { Trans } from '@lingui/macro'
import BasketCubeIcon from 'components/icons/BasketCubeIcon'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { rTokenAssetsAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import AssetBreakdown from './AssetBreakdown'

const BackingResume = () => {
  const rToken = useRToken()
  const assets = useAtomValue(rTokenAssetsAtom)

  return (
    <Text
      mt="2"
      mb={5}
      as="h2"
      variant="heading"
      sx={{ color: 'accent', fontWeight: 'bold' }}
    >
      eUSD has 4 Collaterals pegged to USD
    </Text>
  )
}

const Backing = () => {
  return (
    <Box>
      <Box
        variant="layout.verticalAlign"
        mb={5}
        sx={{ color: 'accent', display: ['none', 'none', 'flex'] }}
      >
        <BasketCubeIcon fontSize={24} />
        <Text ml="3" as="h2" variant="heading">
          <Trans>Backing & Risk</Trans>
        </Text>
      </Box>
      <Text sx={{ fontSize: 26, maxWidth: 720 }}>
        <Trans>
          RTokens are 100% backed by a diversified set of underlying collateral
          tokens...
        </Trans>
      </Text>
      <BackingResume />
      <AssetBreakdown />
    </Box>
  )
}

export default Backing
