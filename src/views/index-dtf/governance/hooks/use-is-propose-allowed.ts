import { walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { IndexDTF } from '@/types'
import { useIndexDtfProposerState } from '@reserve-protocol/react-sdk'
import { useAtomValue } from 'jotai'
import { Address } from 'viem'

function getParams(
  dtf: IndexDTF | undefined,
  account: Address | null,
  governance?: Address
) {
  const governanceAddress = governance ?? dtf?.ownerGovernance?.id

  if (!dtf || !governanceAddress || !account) return undefined

  return {
    chainId: dtf.chainId,
    governance: governanceAddress,
    account,
  }
}

export const useIsProposeAllowed = (governance?: Address) => {
  const dtf = useAtomValue(indexDTFAtom)
  const account = useAtomValue(walletAtom)
  const { data, isLoading } = useIndexDtfProposerState(
    getParams(dtf, account, governance)
  )

  return {
    isProposeAllowed: !!data && data.canPropose,
    isLoading: !!account && isLoading,
  }
}
