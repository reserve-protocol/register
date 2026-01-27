import TransactionButton from '@/components/ui/transaction-button'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { PROPOSAL_STATES } from '@/utils/constants'
import { t } from '@lingui/macro'
import Timelock from 'abis/Timelock'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
import { chainIdAtom, walletAtom } from 'state/atoms'
import {
  encodeAbiParameters,
  Hex,
  keccak256,
  pad,
  parseAbiParameters,
  stringToBytes,
  toBytes,
} from 'viem'
import { useReadContract } from 'wagmi'
import { proposalDetailAtom } from '../atom'

const timelockIdAtom = atom((get) => {
  const proposal = get(proposalDetailAtom)

  if (!proposal) return undefined
  if (proposal?.timelockId) return proposal.timelockId as Hex

  const governorAddress = proposal.governor.toLowerCase() as Hex
  const descriptionHash = keccak256(stringToBytes(proposal.description))

  const governorBytes32 = pad(governorAddress, { size: 32, dir: 'right' })

  // XOR by byte
  const governorBuffer = Buffer.from(governorBytes32.slice(2), 'hex')
  const descHashBuffer = Buffer.from(descriptionHash.slice(2), 'hex')

  const saltBuffer = Buffer.alloc(32)
  for (let i = 0; i < 32; i++) {
    saltBuffer[i] = governorBuffer[i] ^ descHashBuffer[i]
  }

  const timelockSalt = `0x${saltBuffer.toString('hex')}` as Hex

  const encodedParams = encodeAbiParameters(
    parseAbiParameters('address[], uint256[], bytes[], bytes32, bytes32'),
    [
      proposal.targets,
      [0n],
      proposal.calldatas,
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      timelockSalt,
    ]
  )

  return keccak256(encodedParams)
})

const ProposalCancel = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const timelockId = useAtomValue(timelockIdAtom)
  const account = useAtomValue(walletAtom)
  const [proposal, setProposal] = useAtom(proposalDetailAtom)
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

  return (
    <TransactionButton
      variant="destructive"
      size="sm"
      loading={isMining || isLoading}
      mining={isMining}
      disabled={!isReady || !canCancel || status === 'success'}
      onClick={write}
      text={t`Cancel proposal`}
      className={`h-11 bg-transparent border ${
        account ? 'border-destructive' : 'border-primary'
      }`}
    />
  )
}

export default ProposalCancel
