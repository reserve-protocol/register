import { Trans } from '@lingui/macro'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { accountRoleAtom, walletAtom } from 'state/atoms'
import { Box, Card, Divider, Text } from 'theme-ui'
import DeploymentStepTracker from 'views/deploy/components/DeployStep'
import GovernanceHero from './components/GovernanceHero'

const Management = () => {
  const account = useAtomValue(walletAtom)
  const accountRole = useAtomValue(accountRoleAtom)
  const rToken = useRToken()
  const navigate = useNavigate()

  // Guard route in case the user doesnt have role
  useEffect(() => {
    const isManager =
      accountRole.freezer || accountRole.owner || accountRole.pauser

    if (!rToken || !account || !isManager) {
      navigate('/')
    }
  }, [accountRole, rToken?.address])

  return (
    <Box>
      {accountRole.owner && (
        <>
          <DeploymentStepTracker step={5} />
          <GovernanceHero mx={3} p={5} />
          <Divider my={3} />
        </>
      )}

      <Box p={5}>
        <Text variant="title" px={3} sx={{ fontSize: 4 }}>
          {rToken?.symbol} <Trans>Manager</Trans>
        </Text>
        <Card mt={4}></Card>
      </Box>
    </Box>
  )
}

export default Management
