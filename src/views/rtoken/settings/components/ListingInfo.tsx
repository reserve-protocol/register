import { t } from '@lingui/macro'
import { InfoBox } from 'components'
import { SmallButton } from 'components/button'
import { Box, BoxProps, Flex } from 'theme-ui'

const ListingInfo = (props: BoxProps) => (
  <Box variant="layout.borderBox" p={4} {...props}>
    <InfoBox
      title={t`Register Listing`}
      subtitle={t`Please read more about how Register manage tokens on our repository`}
    />
    <Flex mt={2} mb={3}>
      <SmallButton
        variant="muted"
        mr={2}
        onClick={() =>
          window.open('https://github.com/lc-labs/register', '_blank')
        }
      >
        Github/lclabs
      </SmallButton>
    </Flex>
    <InfoBox
      mb={3}
      title={t`What is Reserve Governor Alexios?`}
      subtitle={t`Alexios is standard token-voting adopted from Compound Governor Bravo, with adjustments accounting for RSR being staked across multiple RTokens.`}
    />
    <InfoBox
      mb={3}
      title={t`Unpausing`}
      subtitle={t`If your token is paused and you have the correct role, you can unpause it here.`}
    />
    <InfoBox
      title={t`Roles`}
      subtitle="Please read more about the different roles in Alexios and the Reserve protocol in the documentation."
    />
  </Box>
)

export default ListingInfo
