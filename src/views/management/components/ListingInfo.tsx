import { t } from '@lingui/macro'
import { InfoBox } from 'components'
import { SmallButton } from 'components/button'
import { Box, BoxProps, Flex } from 'theme-ui'

const ListingInfo = (props: BoxProps) => (
  <Box variant="layout.borderBox" {...props}>
    <InfoBox
      title={t`Register Listing`}
      subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam maximus facilisis velit, at venenatis nunc iaculis vitae. Vestibulum ante ipsum primis in faucibus orci luctu."
    />
    <Flex mt={2} mb={3}>
      <SmallButton variant="muted" mr={2}>
        Github/lclabs
      </SmallButton>
      <SmallButton variant="muted">Discord</SmallButton>
    </Flex>
    <InfoBox
      mb={3}
      title={t`How to use?`}
      subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam maximus facilisis velit, at venenatis nunc iaculis vitae vestibulum ante ipsum."
    />
    <InfoBox
      mb={3}
      title={t`Unpausing`}
      subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam maximus facilisis velit, at venenatis nunc iaculis vitae vestibulum ante ipsum."
    />
    <InfoBox
      mb={3}
      title={t`Roles`}
      subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam maximus facilisis velit, at venenatis nunc iaculis vitae vestibulum ante ipsum."
    />
    <InfoBox
      title={t`Source code`}
      subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam maximus facilisis velit, at venenatis nunc iaculis vitae vestibulum ante ipsum."
    />
  </Box>
)

export default ListingInfo
