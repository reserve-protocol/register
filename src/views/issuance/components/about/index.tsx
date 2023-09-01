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
          TODO: Text for explaining wrapping
        </Text>
        <Flex mt={3}>
          <SmallButton variant="muted" mr={3} onClick={() => setWrapping(true)}>
            <Trans>Wrap/Unwrap collateral</Trans>
          </SmallButton>
        </Flex>
      </Box>
    </Box>
  )
}

export default About
