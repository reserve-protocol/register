import { useAtomValue } from 'jotai'
import { currentDivaPointsRate } from '../atoms/bsdETHSupplyAtom'

type DivaPoints = {
  rewardsRate: number
}

const useDivaPoints = (): DivaPoints => {
  const rewardsRate = useAtomValue(currentDivaPointsRate)

  return {
    rewardsRate: rewardsRate,
  }
}

export default useDivaPoints
