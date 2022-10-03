import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { useNavigate } from 'react-router-dom'
import { Box, BoxProps, Text, Grid } from 'theme-ui'
import { ROUTES } from 'utils/constants'

const About = (props: BoxProps) => {
  const navigate = useNavigate()

  return (
    <Box>
      <Grid columns={2} mt={6} pl={5} gap={8}>
        <Box>
          <Text mb={2} sx={{ fontSize: 3, display: 'block', fontWeight: 500 }}>
            <Trans>RTokens</Trans>
          </Text>
          <Text variant="legend">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam
            maximus facilisis velit, at venenatis nunc iaculis . Vestibulum ante
            ipsum primis in faucibus orci luctus et posuere curae. Lorem ipsum
            dolor sit amet, consectetur elit. Etiam maximus facilisis velit, at
            venenatis nunc iaculis vitae.
          </Text>
          <br />
          <br />
          <Text mb={2} sx={{ fontSize: 3, display: 'block', fontWeight: 500 }}>
            <Trans>This app</Trans>
          </Text>
          <Text variant="legend">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. maximus
            facilisis velit, at venenatis nunc iaculis . Vestibulum ante ipsum
            primis in faucibus orci luctus et posuere curae. Lorem ipsum dolor
            sit amet, consectetur adipiscing elit.
          </Text>
          <br />
          <br />
          <Text mb={2} sx={{ fontSize: 3, display: 'block', fontWeight: 500 }}>
            <Trans>How do we get usage data?</Trans>
          </Text>
          <Text variant="legend">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam
            maximus facilisis velit, at venenatis nurae. Lorem ipsum dolor amet,
            consectetur adipiscing elit. Etiam maximus facilisis velit,
            venenatis nunc iaculis vitae.
          </Text>
          <br />
          <br />
          <Text mb={2} sx={{ fontSize: 3, display: 'block', fontWeight: 500 }}>
            <Trans>Reserve</Trans>
          </Text>
          <Text variant="legend">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam
            maximus facilisis velit, at venenatis nurae. Lorem ipsum dolor amet,
            consectetur adipiscing elit. Etiam maximus facilisis velit,
            venenatis nunc iaculis vitae.
          </Text>
        </Box>
        <Box>
          Deploy rToken copy
          <br />
          <SmallButton py={2} mt={6} onClick={() => navigate(ROUTES.DEPLOY)}>
            <Trans>Deploy RToken</Trans>
          </SmallButton>
        </Box>
      </Grid>
    </Box>
  )
}

export default About
