import dtfIndexAbi from '@/abis/dtf-index-abi'
import { TransactionButtonContainer } from '@/components/old/button/TransactionButton'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFAtom, indexDTFPriceAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { t } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { formatEther } from 'viem'
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { InfoCard } from './settings-info-card'

const DistributeFees = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const price = useAtomValue(indexDTFPriceAtom)
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  const { data: pendingFees } = useReadContract({
    abi: dtfIndexAbi,
    address: indexDTF?.id,
    functionName: 'getPendingFeeShares',
    chainId: indexDTF?.chainId,
  })

  const { data: receipt, isLoading } = useWaitForTransactionReceipt({
    hash,
    chainId: indexDTF?.chainId,
  })

  if (!indexDTF) return null

  const distributeFees = () => {
    writeContract({
      abi: dtfIndexAbi,
      address: indexDTF.id,
      functionName: 'distributeFees',
      chainId: indexDTF.chainId,
    })
  }

  const formattedPendingFees = Number(formatEther(pendingFees ?? 0n))

  return (
    <InfoCard title={t`Distribute Fees`} secondary>
      <div className="p-4 flex flex-col gap-4">
        Distribute accumulated fees to the recipients. Anyone can trigger this
        transaction.
        <div className="flex flex-col  gap-1">
          <span className="text-legend block">Pending distribution</span>
          {pendingFees === undefined ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <div>
              <span className="mr-1">
                {formatCurrency(formattedPendingFees)} ${indexDTF.token.symbol}
              </span>
              <span className="text-legend text-sm">
                (${formatCurrency(formattedPendingFees * (price ?? 0))})
              </span>
            </div>
          )}
        </div>
        <TransactionButtonContainer
          chain={indexDTF.chainId}
          className="col-span-2"
        >
          <Button
            onClick={distributeFees}
            variant="outline-primary"
            disabled={isPending || isLoading || receipt?.status === 'success'}
            className="w-full"
          >
            {isPending || isLoading
              ? 'Loading...'
              : receipt?.status === 'success'
                ? 'Fees distributed'
                : 'Distribute Fees'}
          </Button>
        </TransactionButtonContainer>
      </div>
    </InfoCard>
  )
}

export default DistributeFees
