import { useAtomValue } from 'jotai'
import { rTokenAtom } from 'state/atoms'

const useRToken = () => {
  return useAtomValue(rTokenAtom)
}

export default useRToken
