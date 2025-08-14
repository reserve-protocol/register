import TransactionButton from '@/components/old/button/TransactionButton'
import { t } from '@lingui/macro'
import Timelock from 'abis/Timelock'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
import { chainIdAtom, rTokenGovernanceAtom, walletAtom } from 'state/atoms'
import {
  encodeAbiParameters,
  keccak256,
  parseAbiParameters,
  toBytes,
} from 'viem'
import { useReadContract } from 'wagmi'
import { proposalDetailAtom } from '../atom'
import { PROPOSAL_STATES } from '@/utils/constants'
import { indexDTFAtom } from '@/state/dtf/atoms'

const timelockIdAtom = atom((get) => {
  const proposal = get(proposalDetailAtom)

  const encodedParams = proposal
    ? encodeAbiParameters(
        parseAbiParameters('address[], uint256[], bytes[], bytes32, bytes32'),
        [
          proposal.targets,
          [0n],
          proposal.calldatas,
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          keccak256(toBytes(proposal.description)),
        ]
      )
    : undefined

  return encodedParams ? keccak256(encodedParams) : undefined
})

const ProposalCancel = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const timelockId = useAtomValue(timelockIdAtom)
  const account = useAtomValue(walletAtom)
  const [proposal, setProposal] = useAtom(proposalDetailAtom)
  const deadline = proposal?.votingState.deadline
  const chainId = useAtomValue(chainIdAtom)
  const timelockAddress = useMemo(() => {
    if (!indexDTF || !proposal) return undefined

    if (
      indexDTF.ownerGovernance?.id.toLowerCase() ===
      proposal.governor.toLowerCase()
    ) {
      return indexDTF.ownerGovernance.timelock.id
    }

    if (
      indexDTF.tradingGovernance?.id.toLowerCase() ===
      proposal.governor.toLowerCase()
    ) {
      return indexDTF.tradingGovernance.timelock.id
    }

    return indexDTF.stToken?.governance?.timelock?.id
  }, [indexDTF, proposal])

  const { data: canCancel } = useReadContract({
    address: timelockAddress,
    abi: Timelock,
    functionName: 'hasRole',
    args: account ? [keccak256(toBytes('CANCELLER_ROLE')), account] : undefined,
    chainId,
    query: {
      enabled: !!timelockAddress && !!account,
    },
  })

  const { write, isLoading, hash, isReady } = useContractWrite({
    abi: Timelock,
    address: timelockAddress,
    functionName: 'cancel',
    args: timelockId ? [timelockId] : undefined,
    query: { enabled: canCancel },
  })

  const { isMining, status } = useWatchTransaction({
    hash,
    label: 'Proposal canceled',
  })

  useEffect(() => {
    if (status === 'success') {
      setProposal((prev) =>
        prev
          ? {
              ...prev,
              votingState: {
                ...prev.votingState,
                state: PROPOSAL_STATES.CANCELED,
              },
              state: PROPOSAL_STATES.CANCELED,
              cancellationTime: Math.floor(Date.now() / 1000).toString(),
            }
          : undefined
      )
    }
  }, [status])

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
