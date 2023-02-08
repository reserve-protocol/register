import { t, Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { MainInterface } from 'abis'
import DocsLink from 'components/docs-link/DocsLink'
import { ethers } from 'ethers'
import { useContractCall } from 'hooks/useCall'
import useRToken from 'hooks/useRToken'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { accountRoleAtom, addTransactionAtom } from 'state/atoms'
import { useTransaction } from 'state/web3/hooks/useTransactions'
import { Box, BoxProps, Divider as _Divider, Flex, Text } from 'theme-ui'
import { FACADE_WRITE_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import { TRANSACTION_STATUS } from 'utils/constants'
import GovernancePrompt from './GovernancePrompt'
import RoleActions from './RoleActions'
import SettingItem from './SettingItem'

const Divider = () => <_Divider sx={{ borderColor: 'border' }} my={4} mx={-4} />

const Container = ({ children }: BoxProps) => (
  <Box variant="layout.sticky">
    <Box variant="layout.borderBox" mb={4}>
      {children}
    </Box>
  </Box>
)

const RunAuctions = () => {
  const rToken = useRToken()
  const { account } = useWeb3React()
  const addTransaction = useSetAtom(addTransactionAtom)
  const [txId, setTx] = useState('')
  const tx = useTransaction(txId)

  useEffect(() => {
    if (
      tx?.status === TRANSACTION_STATUS.CONFIRMED ||
      tx?.status === TRANSACTION_STATUS.REJECTED
    ) {
      setTx('')
    }
  }, [tx?.status])

  const handleRun = () => {}

  return (
    <SettingItem
      title="RToken auctions"
      subtitle={t`Run all available auctions`}
      action={account && rToken?.address ? t`Run` : ''}
      onAction={handleRun}
      loading={!!txId}
      actionVariant="muted"
    />
  )
}

/**
 * Manage RToken
 * TODO: Allow owner to edit RToken
 */
const RTokenManagement = () => {
  const rToken = useRToken()
  const govRequired = useContractCall(
    rToken?.main
      ? {
          address: rToken.main,
          abi: MainInterface,
          method: 'hasRole',
          args: [
            ethers.utils.formatBytes32String('OWNER'),
            FACADE_WRITE_ADDRESS[CHAIN_ID],
          ],
        }
      : false
  )
  const accountRole = useAtomValue(accountRoleAtom)

  if ((govRequired?.value || [])[0] && accountRole.owner) {
    return <GovernancePrompt />
  }

  return (
    <Container>
      <Flex sx={{ alignItems: 'center' }}>
        <Text variant="sectionTitle">
          <Trans>Actions</Trans>
        </Text>
        <DocsLink link="https://reserve.org/" />
      </Flex>
      <RoleActions />
      <Divider />
      <RunAuctions />
      {/* {accountRole.owner && (
        <>
          <Divider />
          <SettingItem
            title={t`Change by owner`}
            subtitle={t`Available pre-governance`}
            action={t`Edit`}
            icon="owner-edit"
            onAction={handleEdit}
          />
        </>
      )} */}
    </Container>
  )
}

export default RTokenManagement
