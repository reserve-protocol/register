import { useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { proposalTypeAtom } from '../atoms'

export const useProposalStartStep = () => {
  const { t } = useLingui()
  const proposalType = useAtomValue(proposalTypeAtom)

  return proposalType === 'optimistic'
    ? t`Veto delay begins`
    : t`Voting delay begins`
}
