import { t } from '@lingui/macro'
import BackButton from 'components/rtoken-setup/components/BackButton'
import Navigation from 'components/section-navigation/Navigation'
import { useMemo } from 'react'
import { Box } from 'theme-ui'

const NavigationSidebar = () => {
  // TODO: Listen for lang
  const sections = useMemo(
    () => [
      t`Primary basket`,
      t`Emergency basket`,
      t`Revenue share`,
      t`RToken Details`,
      t`Governance`,
      t`Contract Addresses`,
    ],
    []
  )

  return (
    <Box variant="layout.sticky">
      <Navigation title={t`Navigation`} sections={sections} />
    </Box>
  )
}

export default NavigationSidebar
