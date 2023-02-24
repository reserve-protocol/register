import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { Text, BoxProps, Card, Flex } from 'theme-ui'
import DeployIntro from 'components/icons/DeployIntroIcon'

const Intro = (props: BoxProps) => (
  <Card p={4} pt={5} {...props} sx={{ position: 'relative' }}>
    <DeployIntro />
    <Text variant="sectionTitle" mb={2} mt={1}>
      <Trans>Launch your asset backed RToken</Trans>
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
        mr="12px"
        onClick={() => window.open('https://discord.gg/hQ2VJbjjg7', '_blank')}
      >
        <Trans>Community Discord</Trans>
      </SmallButton>
      <SmallButton
        variant="muted"
        onClick={() => window.open('https://reserve.org/protocol/', '_blank')}
      >
        <Trans>Protocol Docs</Trans>
      </SmallButton>
    </Flex>
  </Card>
)

export default Intro
