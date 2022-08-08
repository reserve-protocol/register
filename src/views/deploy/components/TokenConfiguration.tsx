import { Trans } from '@lingui/macro'
import { Button, InfoBox } from 'components'
import RTokenLight from 'components/icons/RTokenLight'
import { useState } from 'react'
import { borderRadius } from 'theme'
import { Box, Divider, Grid, Text } from 'theme-ui'
import BackingForm from './BackingForm'
import OtherForm from './OtherForm'
import StakingTokenInfo from './StakingTokenInfo'
import TokenForm from './TokenForm'

/**
 * View: Deploy -> Token setup
 * Display token forms
 */
const TokenConfiguration = () => {
  const [advanceConfig, setAdvanceConfig] = useState(false)

  return (
    <Grid
      columns={2}
      sx={{ backgroundColor: 'contentBackground', borderRadius: 10 }}
    >
      <Box p={4} sx={{ borderRight: '1px solid', borderColor: 'border' }}>
        <TokenForm mb={4} />
        <BackingForm mb={4} />
        <OtherForm />
      </Box>
      <Box p={4}>
        <StakingTokenInfo />
        <Divider my={5} />
        <Box>
          <InfoBox
            title="Something something"
            subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam maximus facilisis velit, at venenatis nunc iaculis vitae. Vestibulum ante ipsum primis in faucibus orci luctus et  posuere cubilia curae"
            mb={3}
          />
          <InfoBox
            title="Something something"
            subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam maximus facilisis velit, at venenatis nunc iaculis vitae. Vestibulum ante ipsum primis in faucibus orci luctus et  posuere cubilia curae"
            mb={3}
          />
          <InfoBox
            title="Something something"
            subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam maximus facilisis velit, at venenatis nunc iaculis vitae. Vestibulum ante ipsum primis in faucibus orci luctus et  posuere cubilia curae"
            mb={3}
          />
        </Box>
      </Box>
    </Grid>
  )
}

export default TokenConfiguration
