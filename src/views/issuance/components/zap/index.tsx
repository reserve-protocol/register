import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { Suspense, useEffect, useState } from 'react'
import { blockAtom, gasFeeAtom } from 'state/atoms'
import { Card } from 'theme-ui'
import ConfirmZap from './components/ConfirmZap'
import ZapButton from './components/ZapButton'
import ZapInput from './components/ZapInput'
import { selectedZapTokenAtom } from './state/atoms'
import { resolvedZapState } from './state/zapper'

const UpdateBlockAndGas = () => {
  const zapState = useAtomValue(resolvedZapState)
  const block = useAtomValue(blockAtom)
  const gasPriceBn = useAtomValue(gasFeeAtom)
  useEffect(() => {
    if (zapState == null || block == null || gasPriceBn == null) return
    if (block === zapState.currentBlock || gasPriceBn === zapState.gasPrice)
      return
    zapState.updateBlockState(block, gasPriceBn)
  }, [zapState, block, gasPriceBn])
  return null
}

/**
 * Zap widget
 */
const Zap = () => {
  const [isZapping, setZapping] = useState(false)
  const rToken = useRToken()
  const selectedToken = useAtomValue(selectedZapTokenAtom)
  const handleClick = () => {
    setZapping(true)
    mixpanel.track('Clicked Zap', {
      RToken: rToken?.address.toLowerCase() ?? '',
      inputToken: selectedToken?.symbol,
    })
  }

  return (
    <>
      <Suspense fallback={<></>}>
        <UpdateBlockAndGas />
      </Suspense>
      <Card p={4}>
        <ZapInput />
        <ZapButton onClick={handleClick} />
      </Card>
      {isZapping && <ConfirmZap onClose={() => setZapping(false)} />}
    </>
  )
}

export default Zap
