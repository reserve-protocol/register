import { Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { rTokenAtom } from 'state/atoms'
import { Box, BoxProps, Text } from 'theme-ui'

// TODO: Pull this info from listing
const About = (props: BoxProps) => {
  const rToken = useAtomValue(rTokenAtom)

  return (
    <Box {...props}>
      <Text mb={3} sx={{ fontSize: 4, display: 'block', fontWeight: 500 }}>
        <Trans>About {rToken?.symbol}</Trans>
      </Text>
      <Text variant="legend">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam maximus
        facilisis velit, at venenatis nunc iaculis . Vestibulum ante ipsum
        primis in faucibus orci luctus et posuere curae. Lorem ipsum dolor sit
        amet, consectetur elit. Etiam maximus facilisis velit, at venenatis nunc
        iaculis vitae.
      </Text>
      <br />
      <br />
      <Text variant="legend">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. maximus
        facilisis velit, at venenatis nunc iaculis . Vestibulum ante ipsum
        primis in faucibus orci luctus et posuere curae. Lorem ipsum dolor sit
        amet, consectetur adipiscing elit.
      </Text>
      <br />
      <br />
      <Text variant="legend">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam maximus
        facilisis velit, at venenatis nurae. Lorem ipsum dolor amet, consectetur
        adipiscing elit. Etiam maximus facilisis velit, venenatis nunc iaculis
        vitae.
      </Text>
    </Box>
  )
}

export default About
