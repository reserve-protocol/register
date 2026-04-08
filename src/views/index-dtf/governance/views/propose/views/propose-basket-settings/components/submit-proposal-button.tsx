import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { Button } from '@/components/ui/button'
import { TransactionButtonContainer } from '@/components/ui/transaction'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom, iTokenAddressAtom } from '@/state/dtf/atoms'
import { atom, useAtomValue } from 'jotai'
import { Loader2 } from 'lucide-react'
import { memo } from 'react'
import { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import {
  proposalDescriptionAtom,
  basketSettingsProposalDataAtom,
} from '../atoms'
import { useIsBasketProposeAllowed } from '@/views/index-dtf/governance/hooks/use-is-basket-propose-allowed'
import useProposalCreated from '../../../hooks/use-proposal-created'

const isProposalReady = atom((get) => {
  const wallet = get(walletAtom)
  const description = get(proposalDescriptionAtom)
  const proposalData = get(basketSettingsProposalDataAtom)
  const dtf = get(iTokenAddressAtom)

  return wallet && description && proposalData?.calldatas?.length && dtf
})

const ProposeGatekeeper = memo(() => {
  const { isProposeAllowed, isLoading } = useIsBasketProposeAllowed()
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
  const proposalData = useAtomValue(basketSettingsProposalDataAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const { writeContract, isPending, data } = useWriteContract()
  const { data: receipt } = useWaitForTransactionReceipt({
    hash: data,
    chainId,
  })

  const govAddress = dtf?.tradingGovernance?.id

  useProposalCreated({
    receipt,
    targets: proposalData?.targets ?? [],
    calldatas: proposalData?.calldatas ?? [],
    description: description ?? '',
    govAddress: (govAddress ?? '0x') as Address,
    proposer: (wallet ?? '0x') as Address,
  })

  const handleSubmit = () => {
    if (proposalData && description && dtf?.tradingGovernance?.id) {
      const { targets, calldatas } = proposalData
      const values = targets.map(() => 0n)

      console.log('proposal', {
        address: dtf.tradingGovernance.id,
        abi: DTFIndexGovernance,
        functionName: 'propose',
        args: [targets, values, calldatas, description],
        chainId,
      })

      writeContract({
        address: dtf.tradingGovernance.id,
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
          !isReady || isPending || !!data || !dtf?.tradingGovernance?.id
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
