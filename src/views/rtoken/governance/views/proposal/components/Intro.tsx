import { Trans } from '@lingui/macro'
import { SmallButton } from '@/components/old/button'
import { Text, BoxProps, Card, Flex } from 'theme-ui'
import ProposalIntroIcon from 'components/icons/ProposalIntroIcon'
import useRToken from 'hooks/useRToken'

const Intro = (props: BoxProps) => {
  const rToken = useRToken()

  return (
    <Card p={4} pt={5} {...props} sx={{ position: 'relative' }}>
      <ProposalIntroIcon />
      <Text variant="sectionTitle" mb={2} mt={2}>
        <Trans>Propose changes to ${rToken?.symbol}</Trans>
      </Text>
      <Text as="p" variant="legend" pr={4}>
        <Trans>
          Make proposed changes to the backing basket, emergency collateral,
          governance params, etc. Changes in multiple areas can be batched into
          a single proposal although to make voting on issues simpler it may
          make sense to separate things if unrelated.
        </Trans>
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
