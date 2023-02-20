import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { useState } from 'react'
import { Box, Text } from 'theme-ui'
import WrapCollateralModal from '../issue/WrapCollateralModal'

const About = () => {
  const [isWrapping, setWrapping] = useState(false)

  return (
    <Box sx={{ height: 'fit-content' }}>
      <Box variant="layout.borderBox" p={4}>
        <Text variant="strong" mb={2}>
          <Trans>How does this work? </Trans>
        </Text>
        <Text as="p" variant="legend">
          <Trans>
            Minting requires a deposit of the defined collateral tokens in equal
            value amounts to the RToken smart contracts.
          </Trans>
        </Text>
      </Box>
      <Box variant="layout.borderBox" mt={4} p={4}>
        <Text variant="strong" mb={2}>
          <Trans>Wrapping your Aave tokens</Trans>
        </Text>
        <Text as="p" variant="legend">
          <Trans>... explanation about why and the progress...</Trans>
        </Text>
        <SmallButton mt={3} onClick={() => setWrapping(true)}>
          <Trans>Wrap tokens</Trans>
        </SmallButton>
      </Box>
      {isWrapping && <WrapCollateralModal onClose={() => setWrapping(false)} />}
    </Box>
  )
}

export default About
