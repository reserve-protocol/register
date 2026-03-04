import { t, Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/section-navigation/section-navigation'
import useRToken from 'hooks/useRToken'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from 'utils/constants'

const ProposalNavigation = () => {
  // TODO: Listen for lang
  const rToken = useRToken()
  const navigate = useNavigate()
  const sections = useMemo(
    () => [
      t`Intro`,
      t`Backing config`,
      t`Other config`,
      t`Governance`,
      t`Revenue share`,
      t`Primary basket`,
      t`Emergency basket`,
    ],
    []
  )

  const handleBack = () => {
    if (rToken?.address) {
      navigate(ROUTES.GOVERNANCE + `?token=${rToken.address}`)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="sticky top-0 py-8">
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <Trans>Back to Governance</Trans>
        </Button>
      </div>
      <Navigation sections={sections} />
    </div>
  )
}

export default ProposalNavigation
