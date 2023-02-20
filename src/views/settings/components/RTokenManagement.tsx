import { Trans } from '@lingui/macro'
import { MainInterface } from 'abis'
import DocsLink from 'components/docs-link/DocsLink'
import { ethers } from 'ethers'
import { useContractCall } from 'hooks/useCall'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { accountRoleAtom } from 'state/atoms'
import { Box, BoxProps, Divider as _Divider, Flex, Text } from 'theme-ui'
import { FACADE_WRITE_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import FreezeManager from './FreezeManager'
import GovernancePrompt from './GovernancePrompt'
import PauseManager from './PauseManager'

const Divider = () => <_Divider sx={{ borderColor: 'border' }} my={4} mx={-4} />

const Container = ({ children }: BoxProps) => (
  <Box variant="layout.sticky">
    <Box variant="layout.borderBox" mb={4}>
      {children}
    </Box>
  </Box>
)

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
      <Divider />
      <PauseManager />
      <Divider />
      <FreezeManager />
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
