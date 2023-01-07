import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import Navigation from 'components/section-navigation/Navigation'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Text } from 'theme-ui'

const NavigationSidebar = () => {
  // TODO: Listen for lang
  const navigate = useNavigate()
  const sections = useMemo(
    () => [
      t`Intro`,
      t`Basics`,
      t`Primary basket`,
      t`Emergency basket`,
      t`Revenue distribution`,
      t`Backing Manager`,
      t`Other`,
    ],
    []
  )
  const step2Navigation = useMemo(() => [t`Governance`, t`Next steps`], [])

  const handleBack = () => {
    navigate('/')
  }

  return (
    <Box variant="layout.sticky">
      <Box my={5}>
        <SmallButton variant="transparent" onClick={handleBack}>
          <Trans>Exit Deployer</Trans>
        </SmallButton>
      </Box>
      <Navigation
        title={t`Tx 1`}
        txLabel={t`Signing of Tx 1`}
        sections={sections}
      />
      <Navigation
        title={t`Tx 2`}
        txLabel={t`Signing Tx 2`}
        initialIndex={7}
        sections={step2Navigation}
      />
    </Box>
  )
}

export default NavigationSidebar
