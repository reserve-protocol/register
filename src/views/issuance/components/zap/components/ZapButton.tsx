import { t } from '@lingui/macro'
import { LoadingButton, LoadingButtonProps } from 'components/button'
import { useAtom, useAtomValue } from 'jotai'
import { ui } from '../state/ui-atoms'

const ZapButton = (props: Partial<LoadingButtonProps>) => {
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
