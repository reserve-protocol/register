import { useAtomValue } from 'jotai'
import { rTokenAtom } from 'state/atoms'
import { ReserveToken } from 'types'

const useRToken = (): ReserveToken | null => {
  return useAtomValue(rTokenAtom)
}

export default useRToken
