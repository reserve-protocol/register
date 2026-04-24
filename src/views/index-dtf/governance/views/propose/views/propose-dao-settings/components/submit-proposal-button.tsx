import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { Button } from '@/components/ui/button'
import { TransactionButtonContainer } from '@/components/ui/transaction'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom, iTokenAddressAtom } from '@/state/dtf/atoms'
import { atom, useAtomValue } from 'jotai'
import { Loader2 } from 'lucide-react'
import { memo, useRef } from 'react'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { proposalDescriptionAtom, daoSettingsProposalDataAtom } from '../atoms'
import { useIsDAOProposeAllowed } from '@/views/index-dtf/governance/hooks/use-is-dao-propose-allowed'
import useProposalCreated, {
  type SubmitProposalData,
} from '../../../hooks/use-proposal-created'

const isProposalReady = atom((get) => {
  const wallet = get(walletAtom)
  const description = get(proposalDescriptionAtom)
  const proposalData = get(daoSettingsProposalDataAtom)
  const dtf = get(iTokenAddressAtom)

  return wallet && description && proposalData?.calldatas?.length && dtf
})

const ProposeGatekeeper = memo(() => {
  const { isProposeAllowed, isLoading } = useIsDAOProposeAllowed()
  const chainId = useAtomValue(chainIdAtom)

  if (!isLoading && !isProposeAllowed) {
    return (
      <TransactionButtonContainer chain={chainId}>
        <Button disabled className="w-full" variant="default">
          Not enough voting power
        </Button>
      </TransactionButtonContainer>
    )
  }

  return <SubmitProposalButton />
})

const SubmitProposalButton = () => {
  const chainId = useAtomValue(chainIdAtom)
  const wallet = useAtomValue(walletAtom)
  const isReady = useAtomValue(isProposalReady)
  const description = useAtomValue(proposalDescriptionAtom)
  const proposalData = useAtomValue(daoSettingsProposalDataAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const { writeContract, isPending, data } = useWriteContract()
  const { data: receipt } = useWaitForTransactionReceipt({
    hash: data,
    chainId,
  })

  const submitDataRef = useRef<SubmitProposalData | null>(null)

  useProposalCreated({ receipt, dataRef: submitDataRef })

  const handleSubmit = () => {
    if (proposalData && description && dtf?.stToken?.governance?.id && wallet) {
      const { targets, calldatas } = proposalData
      const values: bigint[] = new Array(calldatas.length).fill(0n)

      submitDataRef.current = {
        targets,
        calldatas,
        description,
        govAddress: dtf.stToken.governance.id,
        proposer: wallet,
      }

      writeContract({
        address: dtf.stToken?.governance?.id,
        abi: DTFIndexGovernance,
        functionName: 'propose',
        args: [targets, values, calldatas, description],
        chainId,
      })
    }
  }

  return (
    <TransactionButtonContainer chain={chainId}>
      <Button
        disabled={
          !isReady || isPending || !!data || !dtf?.stToken?.governance?.id
        }
        onClick={handleSubmit}
        className="w-full"
        variant="default"
      >
        {(isPending || !!data) && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        {isPending && 'Pending, sign in wallet...'}
        {!isPending && !!data && 'Waiting for confirmation...'}
        {!isPending && !data && 'Submit proposal onchain'}
      </Button>
    </TransactionButtonContainer>
  )
}

export default ProposeGatekeeper
