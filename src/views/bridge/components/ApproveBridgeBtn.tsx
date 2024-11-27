import ERC20 from 'abis/ERC20'
import TransactionButton from 'components/button/TransactionButton'
import useContractWrite from 'hooks/useContractWrite'
import { useAtomValue } from 'jotai'
import { bridgeApprovalAtom, selectedBridgeToken } from '../atoms'

const ApproveBridgeBtn = () => {
  const approve = useAtomValue(bridgeApprovalAtom)
  const selectedToken = useAtomValue(selectedBridgeToken)
  const { isLoading, gas, hash, isReady, write } = useContractWrite(
    approve
      ? {
          address: approve.token,
          abi: ERC20,
          functionName: 'approve',
          args: [approve.spender, approve.amount],
        }
      : undefined
  )

  return (
    <TransactionButton
      loading={isLoading || !!hash}
      disabled={!isReady}
      loadingText={hash ? 'Waiting for allowance...' : 'Sign in wallet...'}
      gas={gas}
      onClick={write}
      text={
        !isReady
          ? `Verifying allowance...`
          : `Allow use of ${selectedToken.L1symbol}`
      }
      fullWidth
    />
  )
}

export default ApproveBridgeBtn
