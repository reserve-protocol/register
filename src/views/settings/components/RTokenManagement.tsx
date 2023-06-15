import { Trans } from '@lingui/macro'
import { MainInterface } from 'abis'
import DocsLink from 'components/docs-link/DocsLink'
import { ethers } from 'ethers'
import { useContractCall } from 'hooks/useCall'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { accountRoleAtom, getValidWeb3Atom } from 'state/atoms'
import { Card, Flex, Text, Divider as _Divider } from 'theme-ui'
import { FACADE_WRITE_ADDRESS } from 'utils/addresses'
import FreezeManager from './FreezeManager'
import GovernancePrompt from './GovernancePrompt'
import PauseManager from './PauseManager'

const Divider = () => <_Divider sx={{ borderColor: 'border' }} my={4} mx={-4} />

const useGovernanceSetupRequired = () => {
  const rToken = useRToken()
  const { chainId } = useAtomValue(getValidWeb3Atom)
  const accountRole = useAtomValue(accountRoleAtom)
  // If the main contract still has OWNER role, then governance setup is pending
  const govRequired = useContractCall(
    rToken?.main && chainId
      ? {
          address: rToken.main,
          abi: MainInterface,
          method: 'hasRole',
          args: [
            ethers.utils.formatBytes32String('OWNER'),
            FACADE_WRITE_ADDRESS[chainId],
          ],
        }
      : false
  )

  return (govRequired?.value || [])[0] && accountRole.owner
}

/**
 * Manage RToken
 * TODO: Allow owner to edit RToken
 */
const RTokenManagement = () => {
  const isGovernanceSetupRequired = useGovernanceSetupRequired()

  if (isGovernanceSetupRequired) {
    return <GovernancePrompt />
  }

  return (
    <Card p={4}>
      <Flex sx={{ alignItems: 'center' }}>
        <Text variant="title">
          <Trans>Roles & Controls</Trans>
        </Text>
        <DocsLink link="https://reserve.org/" />
      </Flex>
      <Divider />
      <PauseManager />
      <Divider />
      <FreezeManager />
    </Card>
  )
}

export default RTokenManagement
