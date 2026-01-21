import { Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import { Text, BoxProps, Card, Flex } from 'theme-ui'
import ProposalIntroIcon from 'components/icons/ProposalIntroIcon'
import useRToken from 'hooks/useRToken'
import { PROTOCOL_DOCS } from '@/utils/constants'

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
        <Button
          variant="ghost"
          size="sm"
          className="mr-3"
          onClick={() => window.open('https://t.co/kis3OapvFw', '_blank')}
        >
          <Trans>Community Discord</Trans>
        </Button>
        <Button
          variant="muted"
          size="sm"
          onClick={() => window.open(PROTOCOL_DOCS, '_blank')}
        >
          <Trans>Protocol Docs</Trans>
        </Button>
      </Flex>
    </Card>
  )
}

export default Intro
