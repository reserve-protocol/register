import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import BackingForm from 'components/rtoken-setup/token/BackingForm'
import OtherForm from 'components/rtoken-setup/token/OtherForm'
import SectionWrapper from 'components/section-navigation/SectionWrapper'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Box, BoxProps, Card, Divider } from 'theme-ui'
import TokenForm from './TokenForm'

const chevronProps = {
  style: {
    marginRight: 10,
  },
  size: 20,
}

/**
 * View: Deploy -> Token setup
 * Display token forms
 */
const TokenParameters = (props: BoxProps) => {
  const [advanceConfig, setAdvanceConfig] = useState(false)

  return (
    <SectionWrapper threshold={advanceConfig ? 0.2 : 0.8} navigationIndex={4}>
      <Card p={4} {...props}>
        <TokenForm />
        <Divider my={4} mx={-4} />
        <SmallButton
          variant="transparent"
          onClick={() => setAdvanceConfig(!advanceConfig)}
        >
          <Box variant="layout.verticalAlign" sx={{ justifyContent: 'center' }}>
            {advanceConfig ? (
              <ChevronUp {...chevronProps} />
            ) : (
              <ChevronDown {...chevronProps} />
            )}
            <Trans>View all parameters</Trans>
          </Box>
        </SmallButton>
        {advanceConfig && (
          <>
            <BackingForm my={4} />
            <OtherForm />
          </>
        )}
      </Card>
    </SectionWrapper>
  )
}

export default TokenParameters
