import { Trans } from '@lingui/macro'
import SyncedBlock from 'components/synced-block'
import Help from 'components/help'
import { AlertCircle } from 'react-feather'
import { Box, BoxProps, Flex, Link, Text, Card } from 'theme-ui'

const Footer = (props: BoxProps) => (
  <Box m={4} {...props}>
    <Box sx={{ fontSize: 1 }} mb={4}>
      <Card
        mx={-2}
        py={2}
        sx={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255, 138, 0, 0.1)',
          borderRadius: '8px',
          color: 'warning',
        }}
      >
        <AlertCircle size={16} />
        <Text ml={2} mr="auto" sx={{ fontWeight: 500 }}>
          <Trans>Proceed with caution</Trans>
        </Text>
        <Help content="Both Register & the Reserve Protocol are brand new. There are risks with using any new smart contract technology." />
      </Card>
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
