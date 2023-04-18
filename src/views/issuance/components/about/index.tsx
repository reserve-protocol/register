import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { useState } from 'react'
import { Box, Flex, Link, Text } from 'theme-ui'
import UnwrapCollateralModal from '../issue/UnwrapCollateraModal'
import WrapCollateralModal from '../issue/WrapCollateralModal'
import ConvexCollateralModal from '../issue/ConvexCollateralModal'

const About = () => {
  const [isWrapping, setWrapping] = useState(0)
  const [isConvexWrapping, setIsConvexWrapping] = useState(false)

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
            can use to monitor price and appreciation. <br />
            More information in the
          </Trans>{' '}
          <Link
            sx={{ textDecoration: 'underline' }}
            href="https://reserve.org/protocol/rtokens/#non-compatible-erc20-assets"
            target="_blank"
          >
            <Trans>Docs</Trans>
          </Link>
        </Text>
        <Flex mt={3}>
          <SmallButton mr={3} onClick={() => setWrapping(1)}>
            <Trans>Wrap tokens</Trans>
          </SmallButton>
          <SmallButton onClick={() => setWrapping(2)}>
            <Trans>Unwrap tokens</Trans>
          </SmallButton>
        </Flex>
      </Box>
      <Box variant="layout.borderBox" mt={4} p={4}>
        <Text variant="strong" mb={2}>
          <Trans>Wrapping Convex LP Tokens</Trans>
        </Text>
        <Flex mt={3}>
          <SmallButton mr={3} onClick={() => setIsConvexWrapping(true)}>
            <Trans>Wrap/unwrap tokens</Trans>
          </SmallButton>
        </Flex>
      </Box>
      {isWrapping === 1 && (
        <WrapCollateralModal unwrap={false} onClose={() => setWrapping(0)} />
      )}
      {isWrapping === 2 && (
        <UnwrapCollateralModal unwrap={true} onClose={() => setWrapping(0)} />
      )}
      {isConvexWrapping && (
        <ConvexCollateralModal
          unwrap={false}
          onClose={() => setIsConvexWrapping(false)}
        />
      )}
    </Box>
  )
}

export default About
