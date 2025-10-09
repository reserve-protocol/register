import { Button } from '@/components/ui/button'
import { getProposalTitle } from '@/utils'
import { useAtomValue, useSetAtom } from 'jotai'
import { ArrowLeft } from 'lucide-react'
import { currentRebalanceAtom } from '../../../../atoms'
import { showManageWeightsViewAtom } from '../../atoms'

const ManageWeightsHeader = () => {
  const rebalance = useAtomValue(currentRebalanceAtom)
  const setShowView = useSetAtom(showManageWeightsViewAtom)

  return (
    <div className="flex items-center gap-2 p-6 border-b">
      <Button
        variant="muted"
        onClick={() => setShowView(false)}
        size="icon-rounded"
      >
        <ArrowLeft />
      </Button>
      <span className="text-legend">
        {getProposalTitle(rebalance?.proposal.description || '...')}
      </span>
      <span className="font-semibold">/</span>
      <span className="font-semibold">Manage Basket Weights</span>
    </div>
  )
}

export default ManageWeightsHeader