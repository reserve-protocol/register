import { t } from '@lingui/macro'
import { LoadingButton } from 'components/button'
import useBlockNumber from 'hooks/useBlockNumber'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { gasPriceAtomBn } from 'state/atoms'
import { Card } from 'theme-ui'
import ZapInput from './components/ZapInput'
import { ui } from './state/ui-atoms'
import { resolvedZapState, zapperState } from './state/zapper'

const UpdateBlockAndGas = () => {
  const zapState = useAtomValue(resolvedZapState)
  const block = useBlockNumber()
  const gasPriceBn = useAtomValue(gasPriceAtomBn)
  useEffect(() => {
    if (zapState == null || block == null || gasPriceBn == null) return
    if (block === zapState.currentBlock || gasPriceBn.eq(zapState.gasPrice))
      return
    zapState.updateBlockState(block, gasPriceBn.toBigInt())
  }, [zapState, block, gasPriceBn])
  return null
}

/**
 * Zap widget
 */
// TODO: Use confirm modal instead of direct transaction
const Zap = () => {
  const [{ enabled, label }, onZap] = useAtom(ui.button)
  const zapState = useAtomValue(zapperState)
  const [isLoading, hasError] = [
    zapState.state === 'loading',
    zapState.state === 'hasError',
  ]
  const inputProps = isLoading || hasError ? { disabled: true } : {}

  return (
    <>
      <UpdateBlockAndGas />
      <Card p={4}>
        <ZapInput {...inputProps} />
        <LoadingButton
          loading={isLoading}
          variant="primary"
          text={label}
          loadingText={t`Loading zap`}
          disabled={!enabled || isLoading || hasError}
          mt={3}
          sx={{ width: '100%' }}
          onClick={onZap}
        />
      </Card>
    </>
  )
}

export default Zap
