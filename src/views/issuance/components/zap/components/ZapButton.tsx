import { t } from '@lingui/macro'
import { LoadingButton, LoadingButtonProps } from 'components/button'
import { useAtom, useAtomValue } from 'jotai'
import { ui } from '../state/ui-atoms'

const ZapButton = (props: Partial<LoadingButtonProps>) => {
  const [{ enabled, label }, onZap] = useAtom(ui.button)
  const [loading, hasError] = useAtomValue(ui.zapState)

  return (
    <LoadingButton
      loading={loading}
      variant="primary"
      text={label}
      loadingText={t`Loading zap`}
      disabled={!enabled || loading || hasError}
      mt={3}
      sx={{ width: '100%' }}
      onClick={onZap}
      {...props}
    />
  )
}

export default ZapButton
