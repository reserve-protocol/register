import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { Button } from '@/components/ui/button'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom, iTokenAddressAtom } from '@/state/dtf/atoms'
import { atom, useAtomValue } from 'jotai'
import { Loader2 } from 'lucide-react'
import { memo, useRef, useMemo } from 'react'
import { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { proposalDescriptionAtom, basketProposalCalldatasAtom } from '../atoms'
import { useIsProposeAllowed } from '@/views/index-dtf/governance/hooks/use-is-propose-allowed'
import { TransactionButtonContainer } from '@/components/ui/transaction'
import useProposalCreated, {
  type SubmitProposalData,
} from '../../hooks/use-proposal-created'

const isProposalReady = atom((get) => {
  const wallet = get(walletAtom)
  const description = get(proposalDescriptionAtom)
  const calldatas = get(basketProposalCalldatasAtom)
  const dtf = get(iTokenAddressAtom)

  return Boolean(wallet && description && calldatas?.length && dtf)
})

const tradingGovAddress = atom((get) => {
  const dtfData = get(indexDTFAtom)

  return dtfData?.tradingGovernance?.id
})

const ProposeGatekeeper = memo(() => {
  const { isProposeAllowed, isLoading } = useIsProposeAllowed()

  if (!isLoading && !isProposeAllowed) {
    return (
      <Button disabled className="w-full" variant="default">
        Not enough voting power
      </Button>
    )
  }

  return <SubmitProposalButton />
})

const SubmitProposalButton = () => {
  const chainId = useAtomValue(chainIdAtom)
  const wallet = useAtomValue(walletAtom)
  const isReady = useAtomValue(isProposalReady)
  const description = useAtomValue(proposalDescriptionAtom)
  const calldatas = useAtomValue(basketProposalCalldatasAtom)
  const dtf = useAtomValue(iTokenAddressAtom)
  const govAddress = useAtomValue(tradingGovAddress)
  const submitDataRef = useRef<SubmitProposalData | null>(null)

  const targets = useMemo(() => {
    if (!dtf || !calldatas) return []
    return calldatas.map(() => dtf) as Address[]
  }, [dtf, calldatas])

  const { writeContract, isPending, data } = useWriteContract()
  const { data: receipt } = useWaitForTransactionReceipt({
    hash: data,
    chainId,
  })

  useProposalCreated({ receipt, dataRef: submitDataRef })

  const handleSubmit = () => {
    if (dtf && calldatas && description && govAddress && wallet) {
      submitDataRef.current = {
        targets,
        calldatas,
        description,
        govAddress: govAddress as Address,
        proposer: wallet,
      }

      const values: bigint[] = new Array(calldatas.length).fill(0n)

      writeContract({
        address: govAddress,
        abi: DTFIndexGovernance,
        functionName: 'propose',
        args: [targets, values, calldatas, description],
        chainId,
      })
    }
  }

  return (
    <TransactionButtonContainer
      connectButtonClassName="w-full"
      switchChainButtonClassName="w-full"
    >
      <Button
        disabled={!isReady || isPending || !!data || !govAddress}
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
