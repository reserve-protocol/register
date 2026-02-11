import { Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { chainIdAtom } from 'state/atoms'
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
    <Button variant="ghost" size="sm" onClick={handleBack}>
      <div className="flex items-center">
        <ArrowLeft size={14} className="mr-2" />
        <Trans>Exit Deployer</Trans>
      </div>
    </Button>
  )
}

export default BackButton
