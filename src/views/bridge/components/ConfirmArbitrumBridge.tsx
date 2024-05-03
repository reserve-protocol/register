import { Button } from 'components'
import { Box, Text } from 'theme-ui'
import { atom, useAtomValue } from 'jotai'
import {
  bridgeAmountAtom,
  btnLabelAtom,
  isBridgeWrappingAtom,
  selectedBridgeToken,
} from '../atoms'

const redirectAtom = atom((get) => {
  const amount = get(bridgeAmountAtom)
  const asset = get(selectedBridgeToken)
  const isWrapping = get(isBridgeWrappingAtom)

  const url = new URL('https://bridge.arbitrum.io/')
  url.searchParams.append(
    'destinationChain',
    isWrapping ? 'arbitrum-one' : 'ethereum'
  )
  url.searchParams.append(
    'sourceChain',
    isWrapping ? 'ethereum' : 'arbitrum-one'
  )
  if (amount) {
    url.searchParams.append('amount', amount)
  }
  if (asset.L1contract) {
    url.searchParams.append(
      'token',
      (isWrapping ? asset.L1contract : asset.L2contract) as string
    )
  }

  return url.href
})

const ConfirmArbitrumBridge = () => {
  const url = useAtomValue(redirectAtom)
  const confirmLabel = useAtomValue(btnLabelAtom)

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Button mb="2" fullWidth onClick={() => window.open(url, '_blank')}>
        {confirmLabel}
      </Button>
      <Text sx={{ fontSize: 1 }} variant="legend">
        You will be redirected to the Arbitrum official bridge
      </Text>
    </Box>
  )
}

export default ConfirmArbitrumBridge
