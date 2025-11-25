import { indexDTFAtom } from '@/state/dtf/atoms'
import { RESERVE_API } from '@/utils/constants'
import { VoteLockPosition } from '@/views/earn/views/index-dtf/hooks/use-vote-lock-positions'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

export const useVoteLockDAO = () => {
  const indexDTF = useAtomValue(indexDTFAtom)

  return useQuery({
    queryKey: ['vote-lock-dao', indexDTF?.id],
    queryFn: async () => {
      const daoData = await fetch(
        `${RESERVE_API}dtf/daos/${indexDTF?.id}?chainId=${indexDTF?.chainId}`
      )
      if (!daoData.ok) {
        throw new Error('Failed to fetch DTF daos')
      }
      const data = await daoData.json()
      return data as VoteLockPosition
    },
  })
}

export const useVoteLockAPR = (): number | undefined => {
  const { data: daoData } = useVoteLockDAO()

  return daoData?.apr
}
