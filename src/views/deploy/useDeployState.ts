import { useAtom } from 'jotai'
import { useTransaction } from 'state/web3/hooks/useTransactions'
import { deployStateAtom } from './atoms'
import useDeployTx from './useDeploy'

const useDeployState = () => {
  const [state, setState] = useAtom(deployStateAtom)
  const tx = useTransaction(state.deployId)
}

export default useDeployState

const useDeploy = () => {
  const deployTx = useDeployTx()
}
