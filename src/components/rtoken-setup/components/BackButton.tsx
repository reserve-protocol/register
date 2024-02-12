import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { ArrowLeft } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { chainIdAtom } from 'state/atoms'
import { Box } from 'theme-ui'
import { getTokenRoute } from 'utils'

const BackButton = () => {
  const navigate = useNavigate()
  const rToken = useRToken()
  const chainId = useAtomValue(chainIdAtom)

  const handleBack = useCallback(() => {
    if (rToken) {
      navigate(getTokenRoute(rToken.address, chainId))
    } else {
      navigate('/')
    }
  }, [rToken?.address, navigate, chainId])

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
