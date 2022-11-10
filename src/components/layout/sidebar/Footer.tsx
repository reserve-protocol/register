import { Trans } from '@lingui/macro'
import SyncedBlock from 'components/synced-block'
import { Box, BoxProps, Flex, Link, Text } from 'theme-ui'

const Footer = (props: BoxProps) => (
  <Box m={4} {...props}>
    <Box sx={{ fontSize: 1 }} mb={4}>
      <Text sx={{ fontWeight: 500, color: 'danger' }}>
        <Trans>Proceed with caution</Trans>
      </Text>
      <Text as="p" variant="legend" mt={1}>
        <Trans>
          Both Register & the Reserve Protocol are brand new. There are risks
          with using any new smart contract technology.
        </Trans>
      </Text>
    </Box>
    <Flex sx={{ alignItems: 'center' }}>
      <Link target="_blank" href="https://github.com/lc-labs">
        <Text
          sx={{
            fontSize: 0,
          }}
          variant="legend"
        >
          Made by LC Labs
        </Text>
      </Link>
      <Box mx="auto" />
      <SyncedBlock />
    </Flex>
  </Box>
)

export default Footer
