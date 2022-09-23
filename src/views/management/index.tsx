import { t, Trans } from '@lingui/macro'
import { InfoBox } from 'components'
import { LoadingButton } from 'components/button'
import useRToken from 'hooks/useRToken'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  accountRoleAtom,
  addTransactionAtom,
  rTokenStatusAtom,
  walletAtom,
} from 'state/atoms'
import { useTransaction } from 'state/web3/hooks/useTransactions'
import { smallButton } from 'theme'
import { Box, Card, Divider, Flex, Grid, Text } from 'theme-ui'
import { RTOKEN_STATUS, TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import DeploymentStepTracker from 'views/deploy/components/DeployStep'
import GovernanceHero from './components/GovernanceHero'
import ListingInfo from './components/ListingInfo'

const Management = () => {
  const addTransaction = useSetAtom(addTransactionAtom)
  const [unpausing, setUnpausing] = useState('')
  const unpauseTx = useTransaction(unpausing)
  const isTxConfirmed =
    unpauseTx &&
    (unpauseTx.status === TRANSACTION_STATUS.MINING ||
      unpauseTx.status === TRANSACTION_STATUS.CONFIRMED)
  const account = useAtomValue(walletAtom)
  const accountRole = useAtomValue(accountRoleAtom)
  const rToken = useRToken()
  const navigate = useNavigate()
  const rTokenStatus = useAtomValue(rTokenStatusAtom)

  // Guard route in case the user doesnt have role
  useEffect(() => {
    const isManager =
      accountRole.freezer || accountRole.owner || accountRole.pauser

    if (!rToken || !account || !isManager) {
      navigate('/')
    }
  }, [accountRole, rToken?.address])

  const handleUnpause = () => {
    if (rToken?.main) {
      const txId = uuid()
      setUnpausing(txId)
      addTransaction([
        {
          id: txId,
          description: t`Unpause ${rToken?.symbol}`,
          status: TRANSACTION_STATUS.PENDING,
          value: '0',
          call: {
            abi: 'main',
            address: rToken?.main || '',
            method: 'unpause',
            args: [],
          },
        },
      ])
    }
  }

  return (
    <Box>
      {accountRole.owner && (
        <>
          <DeploymentStepTracker step={5} />
          <GovernanceHero mx={5} p={5} />
          <Divider my={3} sx={{ borderColor: 'darkBorder' }} />
        </>
      )}

      <Box p="40px 48px">
        <Flex>
          <Text variant="title" pl={5} sx={{ fontSize: 4 }}>
            {rToken?.symbol} <Trans>Manager</Trans>
          </Text>
          {rTokenStatus === RTOKEN_STATUS.PAUSED &&
            !accountRole.owner &&
            !!rToken?.main &&
            !isTxConfirmed && (
              <LoadingButton
                loading={!!unpausing}
                text={t`Unpause`}
                onClick={handleUnpause}
                variant={!unpausing ? 'primary' : 'accent'}
                sx={{ ...smallButton }}
                ml="auto"
              />
            )}
        </Flex>
        <Grid columns={[1, 1, 1, 2]} mt={4} gap={5}>
          <Card p={5}>
            <Text variant="title">
              <Trans>RToken Info</Trans>
            </Text>
            <Divider my={3} />
            <InfoBox mb={3} title={t`Token name`} subtitle={rToken?.name} />
            <InfoBox mb={3} title={t`Token ticker`} subtitle={rToken?.symbol} />
            <InfoBox mb={3} title={t`Address`} subtitle={rToken?.address} />
            <InfoBox
              mb={4}
              title={t`Register link`}
              subtitle={`${window.location.origin}/overview?token=${rToken?.address}`}
            />
            <Text variant="title">
              <Trans>Staking token Info</Trans>
            </Text>
            <Divider my={3} />
            <InfoBox
              mb={3}
              title={t`Token name`}
              subtitle={rToken?.stToken?.name}
            />
            <InfoBox
              mb={3}
              title={t`Token ticker`}
              subtitle={rToken?.stToken?.symbol}
            />
            <InfoBox title={t`Address`} subtitle={rToken?.stToken?.address} />
          </Card>
          <ListingInfo />
        </Grid>
      </Box>
    </Box>
  )
}

export default Management
