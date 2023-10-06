import { LoadingButton, LoadingButtonProps } from 'components/button'
import { useAtom, useAtomValue } from 'jotai'
import { ui } from '../state/ui-atoms'
import { previousZapTransaction, zapTransaction } from '../state/atoms'
import { useEffect } from 'react'

const ZapButton = (props: Partial<LoadingButtonProps>) => {
  const tx = useAtomValue(zapTransaction)
  const [, setPrevious] = useAtom(previousZapTransaction)
  const ttx = tx.state === "hasData" ? tx.data : null
  useEffect(() => {
    
    if (ttx != null) {
      console.log("Setting previous")
      setPrevious(ttx)
    }
    
  }, [ttx])

  const [{ loading, enabled, label, loadingLabel }, onClick] = useAtom(
    ui.button
  )

  return (
    <LoadingButton
      loading={loading}
      disabled={!enabled}
      text={label}
      variant="primary"
      loadingText={loadingLabel}
      mt={3}
      sx={{ width: '100%' }}
      onClick={onClick}
      {...props}
    />
  )
}

export default ZapButton
