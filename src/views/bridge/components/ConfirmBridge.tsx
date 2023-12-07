import useHasAllowance from 'hooks/useHasAllowance'
import { useAtomValue } from 'jotai'
import { useCallback, useState } from 'react'
import { Box } from 'theme-ui'
import { bridgeApprovalAtom, isBridgeWrappingAtom } from '../atoms'
import ApproveBridgeBtn from './ApproveBridgeBtn'
import ConfirmBridgeBtn from './ConfirmBridgeBtn'
import WithdrawalInfoModal from './WithdrawalInfoModal'

const ConfirmBridge = () => {
  const approvalRequired = useAtomValue(bridgeApprovalAtom)
  const [hasAllowance] = useHasAllowance(
    approvalRequired ? [approvalRequired] : undefined
  )
  const isWrapping = useAtomValue(isBridgeWrappingAtom)
  const [showModal, setModal] = useState(true)

  const handleSuccess = useCallback(() => {
    if (!isWrapping) {
      setModal(true)
    }
  }, [isWrapping])

  return (
    <Box p={4}>
      {showModal && <WithdrawalInfoModal onClose={() => setModal(false)} />}
      {!hasAllowance ? (
        <ApproveBridgeBtn />
      ) : (
        <ConfirmBridgeBtn onSuccess={handleSuccess} />
      )}
    </Box>
  )
}

export default ConfirmBridge
