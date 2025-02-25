import { t } from '@lingui/macro'
import Navigation from 'components/section-navigation/Navigation'
import { useMemo } from 'react'
import { Box, BoxProps } from 'theme-ui'

const NavigationSidebar = (props: BoxProps) => {
  // TODO: Listen for lang
  const sections = useMemo(
    () => [
      t`Roles & Controls`,
      t`Token details`,
      t`Primary basket`,
      t`Emergency basket`,
      t`Revenue share`,
      t`Backing config`,
      t`Other config`,
      t`Governance`,
      t`Contract Addresses`,
    ],
    []
  )

  return (
    <Box variant="layout.sticky" py={5} {...props}>
      <Navigation sections={sections} />
    </Box>
  )
}

export default NavigationSidebar
