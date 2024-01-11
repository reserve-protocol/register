import { Modal } from 'components'
import { LoadingButton } from 'components/button'
import EstimatedGasInfo from 'components/transaction-modal/EstimatedGasInfo'
import TransactionConfirmedModal from 'components/transaction-modal/TransactionConfirmedModal'
import useRToken from 'hooks/useRToken'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Divider } from 'theme-ui'
import {
  approvalPending,
  selectedZapTokenAtom,
  zapTxHash,
} from '../state/atoms'
import { approvalTxFeeAtom, ui, zapTxFeeAtom } from '../state/ui-atoms'
import ZapButton from './ZapButton'
import ZapInput from './ZapInput'
import { useWalletClient } from 'wagmi'

const ApproveZap = () => {
  const isApproving = useAtomValue(approvalPending)
  const approvalTxFee = useAtomValue(approvalTxFeeAtom)
  const state = useAtomValue(ui.zapTxState)
  const handleApprove = useSetAtom(ui.zapButton)
  const client = useWalletClient()
  const selectedToken = useAtomValue(selectedZapTokenAtom)

  
  if (!(state === 'approval' || isApproving)) {
    return null
  }

  

  return (
    <>
      <LoadingButton
        mt={3}
        loading={isApproving || client.isLoading}
        text={`Approve ${selectedToken?.symbol ?? ''} for Zap`}
        onClick={() => handleApprove(client.data!)}
        sx={{ width: '100%' }}
      />
      <EstimatedGasInfo mt={3} fee={approvalTxFee} />
    </>
  )
}

const ConfirmZap = ({ onClose }: { onClose: () => void }) => {
  const rToken = useRToken()
  const [zapHash, setHash] = useAtom(zapTxHash)
  const state = useAtomValue(ui.zapTxState)
  const zapTxFee = useAtomValue(zapTxFeeAtom)
  const { enabled } = useAtomValue(ui.zapButton)

  if (zapHash) {
    return (
      <TransactionConfirmedModal
        hash={zapHash}
        onClose={() => {
          setHash('')
          onClose()
        }}
      />
    )
  }
  return (
    <Modal title={`Easy mint ${rToken?.symbol || ''}`} onClose={onClose}>
      <ZapInput />
      <ApproveZap />
      <Divider mb={2} mt={3} />
      <ZapButton disabled={!enabled || state === 'approval'} />
      {(state === 'send_tx' || state === 'sign_permit') && (
        <EstimatedGasInfo mt={3} fee={zapTxFee} />
      )}
    </Modal>
  )
}

export default ConfirmZap
