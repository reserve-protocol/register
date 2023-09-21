import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { useSetAtom } from 'jotai'
import { Box, Flex, Text } from 'theme-ui'
import { wrapSidebarAtom } from 'views/issuance/atoms'

const About = () => {
  const setWrapping = useSetAtom(wrapSidebarAtom)

  return (
    <Box sx={{ height: 'fit-content' }}>
      <Box variant="layout.borderBox" p={4}>
        <Text variant="strong" mb={2}>
          <Trans>Regular minting </Trans>
        </Text>
        <Text as="p" variant="legend">
          <Trans>
            Minting requires a deposit of the defined collateral tokens in equal
            value amounts to the RToken smart contracts.
          </Trans>
        </Text>

        <Text variant="strong" mt={4} mb={2}>
          <Trans>Wrapping collateral tokens</Trans>
        </Text>
        <Text as="p" variant="legend">
          <Trans>
            Some collateral tokens from protocols like Aave and Convex differ
            technically from other collateral tokens. To ensure proper handling,
            they must be wrapped in a contract for effective monitoring. Once
            wrapped, the collateral remains the same but has a new interface for
            price and appreciation tracking.
          </Trans>
        </Text>
        <Flex mt={3}>
          <SmallButton
            data-testid="wrap-btn"
            variant="muted"
            mr={3}
            onClick={() => setWrapping(true)}
          >
            <Trans>Wrap/Unwrap collateral</Trans>
          </SmallButton>
        </Flex>
      </Box>
    </Box>
  )
}

export default About
