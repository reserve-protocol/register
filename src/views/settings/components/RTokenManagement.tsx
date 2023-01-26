import { t, Trans } from '@lingui/macro'
import { MainInterface } from 'abis'
import DocsLink from 'components/docs-link/DocsLink'
import { ethers } from 'ethers'
import { useContractCall } from 'hooks/useCall'
import useRToken from 'hooks/useRToken'
import { useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  accountRoleAtom,
  addTransactionAtom,
  rTokenContractsAtom,
  rTokenGovernanceAtom,
} from 'state/atoms'
import {
  Box,
  BoxProps,
  Button,
  Divider as _Divider,
  Flex,
  Text,
} from 'theme-ui'
import { FACADE_WRITE_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import { ROUTES, TRANSACTION_STATUS } from 'utils/constants'
import GovernancePrompt from './GovernancePrompt'
import RoleActions from './RoleActions'
import SettingItem from './SettingItem'
import { v4 as uuid } from 'uuid'
import { useWeb3React } from '@web3-react/core'

const Divider = () => <_Divider sx={{ borderColor: 'border' }} my={4} mx={-4} />

const Container = ({ children }: BoxProps) => (
  <Box variant="layout.sticky">
    <Box variant="layout.borderBox" mb={4}>
      {children}
    </Box>
  </Box>
)

const DelegateVotes = () => {
  const addTransaction = useSetAtom(addTransactionAtom)
  const rTokenContracts = useAtomValue(rTokenContractsAtom)
  const { account } = useWeb3React()

  const handleDelegate = () => {
    addTransaction([
      {
        id: uuid(),
        description: 'Delete votes',
        status: TRANSACTION_STATUS.PENDING,
        value: '0',
        call: {
          abi: 'stRSRVotes',
          address: rTokenContracts.stRSR,
          method: 'delegate',
          args: [account],
        },
      },
    ])
  }

  return (
    <Box mt={5}>
      <Button onClick={handleDelegate}>Delegate votes</Button>
    </Box>
  )
}

/**
 * Manage RToken
 */
const RTokenManagement = () => {
  const rToken = useRToken()
  const governance = useAtomValue(rTokenGovernanceAtom)
  const navigate = useNavigate()
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

  const handleProposal = () => {
    navigate(ROUTES.GOVERNANCE_PROPOSAL + `?token=${rToken?.address}`)
  }

  // TODO: Owner edit
  const handleEdit = () => {}

  if (govRequired?.value[0] && accountRole.owner) {
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
      {!!governance.governor && !!governance.timelock && (
        <>
          <Divider />
          <SettingItem
            title={t`Governance proposals`}
            subtitle={t`Available to:`}
            value={t`All stakers`}
            icon="hammer"
            action={t`Create proposal`}
            onAction={handleProposal}
          />
        </>
      )}

      {accountRole.owner && (
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
      )}
      <DelegateVotes />
    </Container>
  )
}

export default RTokenManagement
