import { Trans } from '@lingui/macro'
import { MainInterface } from 'abis'
import DocsLink from 'components/docs-link/DocsLink'
import { ethers } from 'ethers'
import { useContractCall } from 'hooks/useCall'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { accountRoleAtom } from 'state/atoms'
import { Card, Flex, Text, Divider as _Divider } from 'theme-ui'
import { FACADE_WRITE_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import FreezeManager from './FreezeManager'
import GovernancePrompt from './GovernancePrompt'
import PauseManager from './PauseManager'

const Divider = () => <_Divider sx={{ borderColor: 'border' }} my={4} mx={-4} />

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
    <Card p={4}>
      <Flex sx={{ alignItems: 'center' }}>
        <Text variant="title">
          <Trans>Roles & Control</Trans>
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
