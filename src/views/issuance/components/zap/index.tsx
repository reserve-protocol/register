import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { blockAtom, gasPriceAtomBn } from 'state/atoms'
import { Card } from 'theme-ui'
import ConfirmZap from './components/ConfirmZap'
import ZapButton from './components/ZapButton'
import ZapInput from './components/ZapInput'
import { resolvedZapState } from './state/zapper'

const UpdateBlockAndGas = () => {
  const zapState = useAtomValue(resolvedZapState)
  const block = useAtomValue(blockAtom)
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

  return (
    <>
      <UpdateBlockAndGas />
      <Card p={4}>
        <ZapInput />
        <ZapButton onClick={() => setZapping(true)} />
      </Card>
      {isZapping && <ConfirmZap onClose={() => setZapping(false)} />}
    </>
  )
}

export default Zap
