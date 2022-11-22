import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import BackingForm from 'components/rtoken-setup/token/BackingForm'
import OtherForm from 'components/rtoken-setup/token/OtherForm'
import SectionWrapper from 'components/section-navigation/SectionWrapper'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Box, BoxProps, Card, Divider, Flex, Text } from 'theme-ui'

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
const RTokenParameters = (props: BoxProps) => {
  return (
    <SectionWrapper navigationIndex={2}>
      <Card p={4} {...props}>
        <BackingForm />
        <OtherForm />
      </Card>
    </SectionWrapper>
  )
}

export default RTokenParameters
