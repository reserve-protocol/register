import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { accountRoleAtom, walletAtom } from 'state/atoms'
import { Box } from 'theme-ui'

const Management = () => {
  const account = useAtomValue(walletAtom)
  const accountRole = useAtomValue(accountRoleAtom)
  const rToken = useRToken()
  const navigate = useNavigate()

  // Guard route in case the user doesnt have role
  useEffect(() => {
    if (
      !rToken ||
      !account ||
      !accountRole.freezer ||
      !accountRole.owner ||
      !accountRole.pauser
    ) {
      navigate('/')
    }
  }, [accountRole, rToken?.address])

  return <Box>RToken manager!</Box>
}

export default Management
