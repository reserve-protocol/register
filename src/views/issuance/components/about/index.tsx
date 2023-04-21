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

        <Text variant="strong" mt={4} mb={2}>
          <Trans>Wrapping Aave aTokens</Trans>
        </Text>
        <Text as="p" variant="legend">
          aTokens from Aave differ technically from other collateral tokens. To
          ensure proper handling, they must be wrapped in a contract for
          effective monitoring. Once wrapped, aToken collateral remains the same
          but has a new interface for price and appreciation tracking.
        </Text>
        <Flex mt={3}>
          <SmallButton variant="muted" mr={3} onClick={() => setWrapping(1)}>
            <Trans>Wrap tokens</Trans>
          </SmallButton>
          <SmallButton variant="muted" onClick={() => setWrapping(2)}>
            <Trans>Unwrap tokens</Trans>
          </SmallButton>
        </Flex>

        <Text variant="strong" mb={2} mt={4}>
          <Trans>Wrapping Convex LP Tokens</Trans>
        </Text>
        <Flex mt={3}>
          <SmallButton
            variant="muted"
            mr={3}
            onClick={() => setIsConvexWrapping(true)}
          >
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
