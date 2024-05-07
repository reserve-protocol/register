import { useAtomValue } from 'jotai'
import { currentDivaPointsRate, userRewardsAtom } from '../atoms/divaPointsAtoms'

type DivaPoints = {
  rewardsRate: number
  userRewards?: number
}

const useDivaPoints = (): DivaPoints => {
  const rewardsRate = useAtomValue(currentDivaPointsRate)
  const userRewards = useAtomValue(userRewardsAtom)

  return {
    rewardsRate: rewardsRate,
    userRewards: userRewards && userRewards >= 0.005 ? +userRewards.toFixed(2) : undefined,
  }
}

export default useDivaPoints
