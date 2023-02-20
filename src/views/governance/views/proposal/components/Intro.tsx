import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { Text, BoxProps, Card, Flex } from 'theme-ui'
import DeployIntro from 'components/icons/DeployIntroIcon'
import useRToken from 'hooks/useRToken'

const Intro = (props: BoxProps) => {
  const rToken = useRToken()

  return (
    <Card p={4} pt={5} {...props} sx={{ position: 'relative' }}>
      <DeployIntro />
      <Text variant="sectionTitle" mb={2} mt={2}>
        <Trans>Propose changes to ${rToken?.symbol}</Trans>
      </Text>
      <Text as="p" variant="legend" pr={4}>
        <Trans>Proposal text!</Trans>
      </Text>
      <Flex mt={4}>
        <SmallButton
          variant="transparent"
          mr="12px"
          onClick={() => window.open('https://t.co/kis3OapvFw', '_blank')}
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
}

export default Intro
