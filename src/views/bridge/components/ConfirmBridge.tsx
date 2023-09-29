import TransactionButton from 'components/button/TransactionButton'
import useContractWrite from 'hooks/useContractWrite'
import { atom, useAtomValue } from 'jotai'
import { bridgeTxAtom, isBridgeWrappingAtom, selectedTokenAtom } from '../atoms'

const btnLabelAtom = atom((get) => {
  const token = get(selectedTokenAtom)
  const isWrapping = get(isBridgeWrappingAtom)

  return `${isWrapping ? 'Deposit' : 'Withdraw'} ${token.symbol} to ${
    isWrapping ? 'Base' : 'Ethereum'
  }`
})

const ConfirmBridge = () => {
  const tx = useAtomValue(bridgeTxAtom)
  const { isReady, gas, write } = useContractWrite(tx)
  const confirmLabel = useAtomValue(btnLabelAtom)

  return (
    <TransactionButton
      disabled={!isReady}
      gas={gas}
      onClick={write}
      text={confirmLabel}
      sx={{ width: '100%' }}
    />
  )
}

export default ConfirmBridge
