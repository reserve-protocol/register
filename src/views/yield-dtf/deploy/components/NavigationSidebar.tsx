import { t, Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/section-navigation/section-navigation'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { chainIdAtom, selectedRTokenAtom } from 'state/atoms'
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
    <div className="lg:sticky lg:top-0 lg:self-start">
      <div className="mb-5 mt-4 lg:mt-6">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          {governance ? (
            <Trans>Back to settings</Trans>
          ) : (
            <Trans>Exit Deployer</Trans>
          )}
        </Button>
      </div>
      <Navigation title={t`Tx 1`} sections={sections} />
      <span className="text-xs italic block mb-5">
        <Trans>Signing Tx 1</Trans>
      </span>
      <Navigation title={t`Tx 2`} initialIndex={7} sections={step2Navigation} />
      <span className="text-xs italic block">
        <Trans>Signing Tx 2</Trans>
      </span>
    </div>
  )
}

export default NavigationSidebar
