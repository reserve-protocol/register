import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { Text, BoxProps, Box, Card, Flex } from 'theme-ui'
import DeployIntroIcon from 'components/icons/DeployIntroIcon'

const Intro = (props: BoxProps) => (
  <Card p={4} pt={4} {...props} sx={{ position: 'relative' }}>
    <Box ml={'2px'}>
      <DeployIntroIcon />
    </Box>
    <Text variant="sectionTitle" sx={{ fontWeight: 600 }} mb={2} mt={7}>
      <Trans>Deploy an RToken</Trans>
    </Text>
    <Text as="p" variant="legend" pr={4} sx={{ maxWidth: '580px' }}>
      <Trans>
        Deploying through this UI doesn't require deep technical knowledge as
        long as you don't need novel collateral plugins for your baskets.
        However, we encourage you to talk to someone proficient in the protocol
        and read the docs to learn more before confirming any transactions.
      </Trans>
    </Text>
    <Flex mt={4}>
      <SmallButton
        variant="transparent"
        mr={3}
        onClick={() => window.open('https://discord.gg/hQ2VJbjjg7', '_blank')}
      >
        <Trans>Community Discord</Trans>
      </SmallButton>
      <SmallButton
        variant="transparent"
        onClick={() => window.open('https://reserve.org/protocol/', '_blank')}
      >
        <Trans>Protocol Docs</Trans>
      </SmallButton>
    </Flex>
  </Card>
)

export default Intro
