import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { Text, BoxProps, Card, Flex } from 'theme-ui'
import DeployIntro from 'components/icons/DeployIntroIcon'

const Intro = (props: BoxProps) => (
  <Card p={5} {...props} sx={{ position: 'relative' }}>
    <DeployIntro />
    <Text variant="sectionTitle" mb={2} mt={2}>
      <Trans>Deploy an RToken</Trans>
    </Text>
    <Text as="p" variant="legend" pr={4}>
      <Trans>
        Deploying through this UI doesn't require deep technical knowledge as
        long as you don't need unbuilt collateral plugins for your baskets.
        However, we encourage you to talk to someone proficient in the protocol
        and read the docs to learn more before confirming any transactions.
      </Trans>
    </Text>
    <Flex mt={4}>
      <SmallButton variant="transparent" mr="12px">
        <Trans>Community Discord</Trans>
      </SmallButton>
      <SmallButton variant="muted">
        <Trans>Protocol Docs</Trans>
      </SmallButton>
    </Flex>
  </Card>
)

export default Intro
