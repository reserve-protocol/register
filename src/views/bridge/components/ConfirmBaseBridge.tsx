import useHasAllowance from 'hooks/useHasAllowance'
import { useAtomValue } from 'jotai'
import { useCallback, useState } from 'react'
import { bridgeApprovalAtom, isBridgeWrappingAtom } from '../atoms'
import ApproveBridgeBtn from './ApproveBridgeBtn'
import ConfirmBridgeBtn from './ConfirmBridgeBtn'
import WithdrawalInfoModal from './WithdrawalInfoModal'

const ConfirmBaseBridge = () => {
  const approvalRequired = useAtomValue(bridgeApprovalAtom)
  const [hasAllowance] = useHasAllowance(
    approvalRequired ? [approvalRequired] : undefined
  )
  const isWrapping = useAtomValue(isBridgeWrappingAtom)
  const [showModal, setModal] = useState(false)

  const handleSuccess = useCallback(() => {
    if (!isWrapping) {
      setModal(true)
    }
  }, [isWrapping])

  return (
    <>
      {showModal && <WithdrawalInfoModal onClose={() => setModal(false)} />}
      {!hasAllowance ? (
        <ApproveBridgeBtn />
      ) : (
        <ConfirmBridgeBtn onSuccess={handleSuccess} />
      )}
    </>
  )
}

export default ConfirmBaseBridge
