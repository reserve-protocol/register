import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import SectionWrapper from 'components/section-navigation/SectionWrapper'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Box, BoxProps, Card, Divider, Flex, Text } from 'theme-ui'
import BackingForm from './BackingForm'
import OtherForm from './OtherForm'
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
const TokenConfiguration = (props: BoxProps) => {
  const [advanceConfig, setAdvanceConfig] = useState(false)

  return (
    <SectionWrapper navigationIndex={2}>
      <Card p={4} {...props}>
        <TokenForm />
        <Divider my={4} />
        <Flex mt={3} variant="layout.verticalAlign">
          <Text variant="title">
            <Trans>Advanced config:</Trans>
          </Text>
          <Text mx={2} variant="title" sx={{ color: 'secondaryText' }}>
            <Trans>15 params</Trans>
          </Text>
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
      </Card>
    </SectionWrapper>
  )
}

export default TokenConfiguration
