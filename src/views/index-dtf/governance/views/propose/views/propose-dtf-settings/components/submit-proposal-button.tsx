import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { Button } from '@/components/ui/button'
import { TransactionButtonContainer } from '@/components/ui/transaction'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom, iTokenAddressAtom } from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { atom, useAtomValue } from 'jotai'
import { Loader2 } from 'lucide-react'
import { memo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { dtfSettingsProposalDataAtom, proposalDescriptionAtom } from '../atoms'
import { useIsProposeAllowed } from '@/views/index-dtf/governance/hooks/use-is-propose-allowed'
import useRecentProposalReceipt from '@/views/index-dtf/governance/hooks/use-recent-proposal-receipt'

const isProposalReady = atom((get) => {
  const wallet = get(walletAtom)
  const description = get(proposalDescriptionAtom)
  const proposalData = get(dtfSettingsProposalDataAtom)
  const dtf = get(iTokenAddressAtom)

  return wallet && description && proposalData?.calldatas?.length && dtf
})

const ProposeGatekeeper = memo(() => {
  const { isProposeAllowed, isLoading } = useIsProposeAllowed()
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
  const navigate = useNavigate()
  const chainId = useAtomValue(chainIdAtom)
  const isReady = useAtomValue(isProposalReady)
  const description = useAtomValue(proposalDescriptionAtom)
  const proposalData = useAtomValue(dtfSettingsProposalDataAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const handleRecentProposalReceipt = useRecentProposalReceipt()
  const { writeContract, isPending, data: hash } = useWriteContract()
  const { data: receipt, isSuccess } = useWaitForTransactionReceipt({
    hash,
    chainId,
  })

  useEffect(() => {
    if (!isSuccess || !receipt || !dtf?.ownerGovernance?.id) return

    void handleRecentProposalReceipt({
      receipt,
      governor: dtf.ownerGovernance.id,
      onFallback: () => {
        setTimeout(() => {
          navigate(`../${ROUTES.GOVERNANCE}`)
        }, 10000)
      },
    })
  }, [
    dtf?.ownerGovernance?.id,
    handleRecentProposalReceipt,
    isSuccess,
    navigate,
    receipt,
  ])

  const handleSubmit = () => {
    if (proposalData && description && dtf?.ownerGovernance?.id) {
      const values: bigint[] = new Array(proposalData.calldatas.length).fill(0n)

      writeContract({
        address: dtf.ownerGovernance?.id,
        abi: DTFIndexGovernance,
        functionName: 'propose',
        args: [
          proposalData.targets,
          values,
          proposalData.calldatas,
          description,
        ],
        chainId,
      })
    }
  }

  return (
    <TransactionButtonContainer chain={chainId}>
      <Button
        disabled={!isReady || isPending || !!hash || !dtf?.ownerGovernance?.id}
        onClick={handleSubmit}
        className="w-full"
        variant="default"
      >
        {(isPending || !!hash) && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        {isPending && 'Pending, sign in wallet...'}
        {!isPending && !!hash && 'Waiting for confirmation...'}
        {!isPending && !hash && 'Submit proposal onchain'}
      </Button>
    </TransactionButtonContainer>
  )
}

export default ProposeGatekeeper
