import { Trans } from '@lingui/macro'
import Main from 'abis/Main'
import DocsLink from 'components/docs-link/DocsLink'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { accountRoleAtom, getValidWeb3Atom } from 'state/atoms'
import { Card, Flex, Text, Divider as _Divider } from 'theme-ui'
import { FACADE_WRITE_ADDRESS } from 'utils/addresses'
import { stringToHex } from 'viem'
import { Address, useContractRead } from 'wagmi'
import FreezeManager from './FreezeManager'
import GovernancePrompt from './GovernancePrompt'
import PauseManager from './PauseManager'

const Divider = () => <_Divider sx={{ borderColor: 'border' }} my={4} mx={-4} />

const useGovernanceSetupRequired = () => {
  const rToken = useRToken()
  const { chainId } = useAtomValue(getValidWeb3Atom)
  const accountRole = useAtomValue(accountRoleAtom)

  // If the main contract still has OWNER role, then governance setup is pending
  const { data } = useContractRead({
    address: rToken?.main as Address,
    abi: Main,
    functionName: 'hasRole',
    args: [
      stringToHex('OWNER', { size: 32 }),
      FACADE_WRITE_ADDRESS[chainId ?? 1] as Address,
    ],
  })

  return data && accountRole.owner
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
