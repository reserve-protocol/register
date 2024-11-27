import { t } from '@lingui/macro'
import Timelock from 'abis/Timelock'
import TransactionButton from 'components/button/TransactionButton'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { rTokenGovernanceAtom, walletAtom } from 'state/atoms'
import { getProposalStateAtom, timelockIdAtom } from '../atom'
import { keccak256, toBytes } from 'viem'
import { useReadContract } from 'wagmi'

const ProposalCancel = () => {
  const governance = useAtomValue(rTokenGovernanceAtom)
  const timelockId = useAtomValue(timelockIdAtom)
  const account = useAtomValue(walletAtom)
  const { deadline } = useAtomValue(getProposalStateAtom)

  const { data: canCancel } = useReadContract({
    address: governance.timelock,
    abi: Timelock,
    functionName: 'hasRole',
    args: account ? [keccak256(toBytes('CANCELLER_ROLE')), account] : undefined,
  })

  const { write, isLoading, hash, isReady } = useContractWrite({
    abi: Timelock,
    address: governance?.timelock,
    functionName: 'cancel',
    args: timelockId ? [timelockId] : undefined,
    query: { enabled: canCancel },
  })

  const { isMining, status } = useWatchTransaction({
    hash,
    label: 'Proposal canceled',
  })

  if (!deadline || deadline <= 0) return null

  return (
    <TransactionButton
      variant="danger"
      small
      loading={isMining || isLoading}
      mining={isMining}
      disabled={!isReady || !canCancel || status === 'success'}
      onClick={write}
      text={t`Cancel proposal`}
      sx={{
        height: '44px',
        bg: 'transparent',
        border: '1px solid',
        borderColor: account ? 'danger' : 'primary',
      }}
    />
  )
}

export default ProposalCancel
