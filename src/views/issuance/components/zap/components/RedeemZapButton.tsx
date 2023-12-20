import { LoadingButton, LoadingButtonProps } from 'components/button'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useWalletClient } from 'wagmi'
import { previousRedeemZapTransaction, redeemZapTransaction } from '../state/atoms'
import { ui } from '../state/ui-atoms'

const RedeemZapButton = (props: Partial<LoadingButtonProps>) => {
  const tx = useAtomValue(redeemZapTransaction)
  const setPrevious = useSetAtom(previousRedeemZapTransaction)
  const ttx = tx.state === 'hasData' ? tx.data : null
  useEffect(() => {
    if (ttx != null) {
      setPrevious(ttx)
    }
  }, [ttx])

  const walletClient = useWalletClient()

  const [{ loading, enabled, redeemButtonLabel, loadingLabel }, onClick] = useAtom(
    ui.redeemZapButton
  )

  return (
    <LoadingButton
      loading={loading || walletClient.isLoading}
      disabled={!enabled}
      text={redeemButtonLabel}
      variant="primary"
      loadingText={loadingLabel}
      mt={3}
      sx={{ width: '100%' }}
      onClick={() => onClick(walletClient.data!)}
      {...props}
    />
  )
}

export default RedeemZapButton
