import { t, Trans } from '@lingui/macro'
import { Main } from 'abis/types'
import { InfoBox } from 'components'
import { LoadingButton } from 'components/button'
import Layout from 'components/rtoken-setup/Layout'
import { ethers } from 'ethers'
import { useMainContract } from 'hooks/useContract'
import useRToken from 'hooks/useRToken'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
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
import { FACADE_WRITE_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import { RTOKEN_STATUS, TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import DeploymentStepTracker from 'views/deploy/components/DeployStep'
import ListingInfo from './components/ListingInfo'

const _Management = () => {
  const addTransaction = useSetAtom(addTransactionAtom)
  const [unpausing, setUnpausing] = useState('')
  const [govRequired, setGovRequired] = useState(false)
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
  const mainContract = useMainContract(rToken?.main)

  const isGovRequired = useCallback(async (contract: Main) => {
    try {
      const hasRole = await contract.hasRole(
        ethers.utils.formatBytes32String('OWNER'),
        FACADE_WRITE_ADDRESS[CHAIN_ID]
      )

      setGovRequired(hasRole)
    } catch (e) {
      console.error('Error getting gov required', e)
    }
  }, [])

  // Guard route in case the user doesnt have role
  useEffect(() => {
    const isManager =
      accountRole.freezer || accountRole.owner || accountRole.pauser

    if (!rToken || !account || !isManager) {
      navigate('/')
    }
  }, [accountRole, rToken?.address])

  useEffect(() => {
    if (mainContract) {
      isGovRequired(mainContract)
    }
  }, [mainContract])

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
      {accountRole.owner && govRequired && (
        <>
          <DeploymentStepTracker step={5} />
          {/* <GovernanceHero mx={5} p={5} /> */}
          <Divider my={3} sx={{ borderColor: 'darkBorder' }} />
        </>
      )}

      <Box p={[4, 5]}>
        <Flex>
          <Text variant="title" pl={5} sx={{ fontSize: 4 }}>
            {rToken?.symbol} <Trans>Manager</Trans>
          </Text>
          {!govRequired &&
            rTokenStatus === RTOKEN_STATUS.PAUSED &&
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

const NavigationSidebar = () => {}

const Management = () => {
  return <Layout></Layout>
}

export default Management
