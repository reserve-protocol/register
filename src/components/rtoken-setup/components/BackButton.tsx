import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import useRToken from 'hooks/useRToken'
import { useCallback } from 'react'
import { ArrowLeft } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { Box } from 'theme-ui'
import { ROUTES } from 'utils/constants'

const BackButton = () => {
  const navigate = useNavigate()
  const rToken = useRToken()

  const handleBack = useCallback(() => {
    if (rToken) {
      navigate(`${ROUTES.OVERVIEW}?token=${rToken.address}`)
    } else {
      navigate('/')
    }
  }, [rToken?.address, navigate])

  return (
    <SmallButton variant="transparent" onClick={handleBack}>
      <Box variant="layout.verticalAlign">
        <ArrowLeft size={14} style={{ marginRight: 10 }} />
        <Trans>Exit Deployer</Trans>
      </Box>
    </SmallButton>
  )
}

export default BackButton
