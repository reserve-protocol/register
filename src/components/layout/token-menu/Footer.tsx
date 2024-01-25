import SyncedBlock from 'components/synced-block'
import { Box, BoxProps, Flex, Link, Text, Card } from 'theme-ui'

const Footer = (props: BoxProps) => (
  <Box px={6} mb={8} mt={6} {...props}>
    <Flex sx={{ alignItems: 'center' }}>
      <Link target="_blank" href="https://github.com/lc-labs">
        <Text variant="smallLabel">Made by ABC Labs</Text>
      </Link>
      <Box mx="auto" />
      <SyncedBlock />
    </Flex>
  </Box>
)

export default Footer
