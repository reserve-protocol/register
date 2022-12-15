import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import Navigation from 'components/section-navigation/Navigation'
import { useMemo } from 'react'
import { ArrowLeft } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { Box } from 'theme-ui'

const NavigationSidebar = () => {
  const navigate = useNavigate()

  // TODO: Listen for lang
  const sections = useMemo(
    () => [
      t`Intro`,
      t`Primary basket`,
      t`Emergency basket`,
      t`Revenue split`,
      t`RToken params`,
    ],
    []
  )

  const step2Navigation = useMemo(
    () => [t`Governance setup`, t`Register listing`],
    []
  )

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        display: ['none', 'none', 'none', 'inherit'],
      }}
    >
      <Box mb={4}>
        <SmallButton variant="muted" onClick={() => navigate('/')}>
          <Box variant="layout.verticalAlign">
            <ArrowLeft size={14} style={{ marginRight: 10 }} />
            <Trans>Back to "Main"</Trans>
          </Box>
        </SmallButton>
      </Box>
      <Navigation title={t`Step 1`} sections={sections} />
      <Navigation
        title={t`Step 2`}
        initialIndex={5}
        sections={step2Navigation}
      />
    </Box>
  )
}

export default NavigationSidebar
