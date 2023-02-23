import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { useState } from 'react'
import { Box, Text, Link } from 'theme-ui'
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
          <Trans>Wrapping Aave aTokens</Trans>
        </Text>
        <Text as="p" variant="legend">
          <Trans>
            aTokens from Aave don’t operate exactly the same technically as some
            other collateral tokens. In order for the protocol to predictably
            know how to handle them, they need to be wrapped into an additional
            “wrapper” contract so that the collateral can be handled and
            monitored appropriately. When wrapped, the aToken collateral is
            exactly the same, but it just has a new interface that the protocol
            can use to monitor price and appreciation. More information in the
          </Trans>{' '}
          <Link
            sx={{ textDecoration: 'underline' }}
            href="https://reserve.org/protocol/rtokens/#non-compatible-erc20-assets"
            target="_blank"
          >
            <Trans>Docs</Trans>
          </Link>
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
