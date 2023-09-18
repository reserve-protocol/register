import useBlockNumber from 'hooks/useBlockNumber'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { gasPriceAtomBn, rTokenAtom } from 'state/atoms'
import { Card } from 'theme-ui'
import mixpanel from 'mixpanel-browser'

import ConfirmZap from './components/ConfirmZap'
import ZapButton from './components/ZapButton'
import ZapInput from './components/ZapInput'
import { resolvedZapState } from './state/zapper'
import { selectedZapTokenAtom } from './state/atoms'

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
const Zap = () => {
  const [isZapping, setZapping] = useState(false)
  const rToken = useAtomValue(rTokenAtom)
  const selectedToken = useAtomValue(selectedZapTokenAtom)

  return (
    <>
      <UpdateBlockAndGas />
      <Card p={4}>
        <ZapInput />
        <ZapButton
          onClick={() => {
            mixpanel.track('Clicked Zap', {
              RToken: rToken?.address.toLowerCase() ?? '',
              inputToken: selectedToken?.symbol,
            })
            setZapping(true)
          }}
        />
      </Card>
      {isZapping && <ConfirmZap onClose={() => setZapping(false)} />}
    </>
  )
}

export default Zap
