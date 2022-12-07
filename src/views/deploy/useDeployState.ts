import { useAtom } from 'jotai'
import { deployStateAtom } from './atoms'
const useDeployState = () => {
  const [state, setState] = useAtom(deployStateAtom)
}

export default useDeployState
