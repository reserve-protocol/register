import { Trans } from '@lingui/macro'
import { InfoBox } from 'components'
import { SmallButton } from 'components/button'
import Help from 'components/help'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Box, Divider, Flex, Grid, Text } from 'theme-ui'
import BackingForm from './BackingForm'
import OtherForm from './OtherForm'
import StakingTokenInfo from './StakingTokenInfo'
import TokenForm from './TokenForm'

const chevronProps = {
  style: {
    marginLeft: 10,
  },
  size: 14,
}

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
        <TokenForm />
        <Divider my={4} />
        <Flex mt={3} variant="layout.verticalAlign">
          <Text variant="title">
            <Trans>Advanced config:</Trans>
          </Text>
          <Text mx={2} variant="title" sx={{ color: 'secondaryText' }}>
            <Trans>16 params</Trans>
          </Text>
          <Help content="testtesttest" />
          <SmallButton
            ml="auto"
            variant="muted"
            onClick={() => setAdvanceConfig(!advanceConfig)}
          >
            <Box variant="layout.verticalAlign">
              <Trans>Customize</Trans>
              {advanceConfig ? (
                <ChevronUp {...chevronProps} />
              ) : (
                <ChevronDown {...chevronProps} />
              )}
            </Box>
          </SmallButton>
        </Flex>
        {advanceConfig && (
          <>
            <BackingForm my={4} />
            <OtherForm />
          </>
        )}
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
