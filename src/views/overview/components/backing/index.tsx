import { Trans } from '@lingui/macro'
import BasketCubeIcon from 'components/icons/BasketCubeIcon'
import { Box, Text } from 'theme-ui'

const Backing = () => {
  return (
    <Box>
      <Box variant="layout.verticalAlign" mb={5} sx={{ color: 'accent' }}>
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
    </Box>
  )
}

export default Backing
