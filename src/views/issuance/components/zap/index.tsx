import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { Component, Suspense, useEffect, useState } from 'react'
import { blockAtom, gasFeeAtom } from 'state/atoms'
import { Card } from 'theme-ui'
import ConfirmZap from './components/ConfirmZap'
import ZapButton from './components/ZapButton'
import ZapInput from './components/ZapInput'
import { ZapSettings } from './components/ZapSettings'
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

class CatchErrors extends Component<{ children: any }> {
  state = {
    hasError: false,
  }
  constructor(props: any) {
    super(props)
  }
  componentDidCatch() {
    this.setState({ hasError: true })
  }

  render() {
    if (this.state.hasError) {
      return null
    }
    return <>{this.props.children}</>
  }
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
    <CatchErrors>
      <Suspense fallback={<></>}>
        <UpdateBlockAndGas />
      </Suspense>
      <Card p={4}>
        <ZapSettings />
        <ZapInput />
        <ZapButton onClick={handleClick} />
      </Card>
      {isZapping && <ConfirmZap onClose={() => setZapping(false)} />}
    </CatchErrors>
  )
}

export default Zap
