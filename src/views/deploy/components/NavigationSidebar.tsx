import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import Navigation from 'components/section-navigation/Navigation'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { chainIdAtom, selectedRTokenAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { getTokenRoute } from 'utils'
import { ROUTES } from 'utils/constants'

const NavigationSidebar = ({ governance = false }) => {
  // TODO: Listen for lang
  const rToken = useAtomValue(selectedRTokenAtom)
  const chainId = useAtomValue(chainIdAtom)
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
    if (governance && rToken) {
      navigate(getTokenRoute(rToken, chainId, ROUTES.SETTINGS))
    } else {
      navigate('/')
    }
  }

  return (
    <Box variant="layout.stickyNoHeader">
      <Box my={5}>
        <SmallButton variant="transparent" onClick={handleBack}>
          {governance ? (
            <Trans>Back to settings</Trans>
          ) : (
            <Trans>Exit Deployer</Trans>
          )}
        </SmallButton>
      </Box>
      <Navigation title={t`Tx 1`} sections={sections} />
      <Text sx={{ fontSize: 1, fontStyle: 'italic' }} mb={5}>
        <Trans>Signing Tx 1</Trans>
      </Text>
      <Navigation title={t`Tx 2`} initialIndex={7} sections={step2Navigation} />
      <Text sx={{ fontSize: 1, fontStyle: 'italic' }}>
        <Trans>Signing Tx 2</Trans>
      </Text>
    </Box>
  )
}

export default NavigationSidebar
