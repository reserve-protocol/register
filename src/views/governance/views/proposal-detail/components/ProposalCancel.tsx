import { t } from '@lingui/macro'
import Timelock from 'abis/Timelock'
import TransactionButton from 'components/button/TransactionButton'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { rTokenGovernanceAtom, walletAtom } from 'state/atoms'
import { canExecuteAtom, timelockIdAtom } from '../atom'
import { useContractRead } from 'wagmi'
import { keccak256, toBytes } from 'viem'

const ProposalCancel = () => {
  const governance = useAtomValue(rTokenGovernanceAtom)
  const timelockId = useAtomValue(timelockIdAtom);
  const canExecute = useAtomValue(canExecuteAtom);
  const account = useAtomValue(walletAtom)

  const { data: canCancel } = useContractRead({
    address: governance.timelock,
    abi: Timelock,
    functionName: 'hasRole',
    args: account ? [
      keccak256(toBytes('CANCELLER_ROLE')),
      account,
    ] : undefined,
  })

  const { write, isLoading, hash, isReady } = useContractWrite({
    abi: Timelock,
    address: governance?.timelock,
    functionName: 'cancel',
    args: timelockId ? [timelockId] : undefined,
  })

  const { isMining, status } = useWatchTransaction({
    hash,
    label: 'Proposal canceled',
  })

  if (!canCancel || status == 'success') {
    return null
  }

  return (
    <TransactionButton
      small
      loading={isMining || isLoading}
      mining={isMining}
      ml={canExecute ? 1 : 'auto'}
      disabled={!isReady}
      onClick={write}
      text={t`Cancel proposal`}
    />
  )
}

export default ProposalCancel
