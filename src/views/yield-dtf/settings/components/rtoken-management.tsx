import { t } from '@lingui/macro'
import Main from '@/abis/Main'
import DocsLink from '@/components/utils/docs-link'
import useRToken from '@/hooks/useRToken'
import { useAtomValue } from 'jotai'
import { accountRoleAtom, chainIdAtom } from '@/state/atoms'
import { FACADE_WRITE_ADDRESS } from '@/utils/addresses'
import { Address, stringToHex } from 'viem'
import FreezeManager from './freeze-manager'
import GovernancePrompt from './governance-prompt'
import PauseManager from './pause-manager'
import { useReadContract } from 'wagmi'
import { InfoCard } from './settings-info-card'

const useGovernanceSetupRequired = () => {
  const rToken = useRToken()
  const chainId = useAtomValue(chainIdAtom)
  const accountRole = useAtomValue(accountRoleAtom)

  const { data } = useReadContract({
    address: rToken?.main as Address,
    abi: Main,
    functionName: 'hasRole',
    chainId,
    args: [
      stringToHex('OWNER', { size: 32 }),
      FACADE_WRITE_ADDRESS[chainId] as Address,
    ],
  })

  return data && !!accountRole?.owner
}

const RTokenManagement = () => {
  const isGovernanceSetupRequired = useGovernanceSetupRequired()

  if (isGovernanceSetupRequired) {
    return <GovernancePrompt />
  }

  return (
    <InfoCard
      title={t`Roles & Controls`}
      action={<DocsLink link="https://reserve.org/" />}
      secondary
    >
      <div className="p-4">
        <PauseManager />
        <hr className="my-4 -mx-4 border-border" />
        <FreezeManager />
      </div>
    </InfoCard>
  )
}

export default RTokenManagement
