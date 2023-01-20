import { t, Trans } from '@lingui/macro'
import { MainInterface } from 'abis'
import GovernanceActionIcon from 'components/icons/GovernanceActionIcon'
import DocsLink from 'components/docs-link/DocsLink'
import { ethers } from 'ethers'
import { useContractCall } from 'hooks/useCall'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { accountRoleAtom, rTokenGovernanceAtom } from 'state/atoms'
import {
  Box,
  BoxProps,
  Button,
  Divider as _Divider,
  Flex,
  Image,
  Text,
} from 'theme-ui'
import { FACADE_WRITE_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import { ROUTES } from 'utils/constants'
import FreezeManager from './FreezeManager'
import PauseManager from './PauseManager'
import SettingItem from './SettingItem'

const Divider = () => <_Divider sx={{ borderColor: 'border' }} my={4} mx={-4} />

const Container = ({ children }: BoxProps) => (
  <Box variant="layout.sticky">
    <Box variant="layout.borderBox" mb={4}>
      {children}
    </Box>
  </Box>
)

const GovernancePromp = () => {
  const navigate = useNavigate()

  return (
    <Container>
      <Flex
        sx={{
          alignItems: 'center',
          flexDirection: 'column',
          textAlign: 'center',
        }}
      >
        <GovernanceActionIcon />
        <Text variant="title" sx={{ fontSize: 4 }} mt={2}>
          <Trans>Governance setup required</Trans>
        </Text>
        <Text variant="legend" as="p" mt={2} sx={{ textAlign: 'center' }}>
          Please complete the required governance configuration to start using
          your RToken
        </Text>
        <Button
          onClick={() => navigate(ROUTES.GOVERNANCE_SETUP)}
          mt={4}
          sx={{ width: '100%' }}
        >
          <Trans>Setup Governance</Trans>
        </Button>
      </Flex>
    </Container>
  )
}

// TODO: Fetch roles from theGraph - display correct address
// TODO: detect if it is alexios governance
const RTokenManagement = () => {
  const rToken = useRToken()
  const governance = useAtomValue(rTokenGovernanceAtom)
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

  const handleProposal = () => {}

  const handleEdit = () => {}

  if (govRequired?.value[0] && accountRole.owner) {
    return <GovernancePromp />
  }

  return (
    <Container>
      <Flex sx={{ alignItems: 'center' }}>
        <Text variant="sectionTitle">
          <Trans>Actions</Trans>
        </Text>
        <DocsLink link="https://reserve.org/" />
      </Flex>
      <Divider />
      <PauseManager />
      <Divider />
      <FreezeManager />
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
            title="Change by owner"
            subtitle={t`Available pre-governance`}
            action={t`Edit`}
            icon="owner-edit"
            onAction={handleEdit}
          />
        </>
      )}
    </Container>
  )
}

export default RTokenManagement
