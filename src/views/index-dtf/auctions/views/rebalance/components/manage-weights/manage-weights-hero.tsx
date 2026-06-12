import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { PencilRuler } from 'lucide-react'
import { savedWeightsAtom } from '../../atoms'

const ManageWeightsHero = () => {
  const savedWeights = useAtomValue(savedWeightsAtom)

  if (savedWeights) return null

  return (
    <div className="flex flex-col gap-1 p-6 text-center items-center">
      <div className="p-2 rounded-full border border-primary text-primary">
        <PencilRuler className="w-4 h-4" />
      </div>
      <h1 className="text-xl font-semibold text-primary mt-1">
        <Trans>Manage weights before proceeding</Trans>
      </h1>
      <p className="text-legend">
        <Trans>
          You need to confirm desired weights before running rebalance auctions.
        </Trans>
      </p>
    </div>
  )
}

export default ManageWeightsHero