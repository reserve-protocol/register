import { t } from '@lingui/macro'
import BackButton from 'components/rtoken-setup/components/BackButton'
import Navigation from 'components/section-navigation/Navigation'
import { useMemo } from 'react'
import { Box } from 'theme-ui'

const NavigationSidebar = () => {
  // TODO: Listen for lang
  const sections = useMemo(
    () => [
      t`Intro`,
      t`Primary basket`,
      t`Emergency collateral`,
      t`Revenue distribution`,
      t`Parameters`,
    ],
    []
  )

  const step2Navigation = useMemo(() => [t`Governance`, t`Next steps`], [])

  return (
    <Box variant="layout.sticky">
      <Box mt={4} mb={6}>
        <BackButton />
      </Box>
      <Navigation title={t`Tx. 1`} sections={sections} />
      <Navigation
        title={t`Tx. 2`}
        initialIndex={5}
        sections={step2Navigation}
      />
    </Box>
  )
}

export default NavigationSidebar
