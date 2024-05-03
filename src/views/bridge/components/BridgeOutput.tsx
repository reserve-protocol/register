import { Trans } from '@lingui/macro'
import ChainLogo from 'components/icons/ChainLogo'
import TokenLogo from 'components/icons/TokenLogo'
import { atom, useAtomValue } from 'jotai'
import { walletAtom } from 'state/atoms'
import { borderRadius } from 'theme'
import { Box, Card, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { ChainId } from 'utils/chains'
import { CHAIN_TAGS } from 'utils/constants'
import { useBalance } from 'wagmi'
import {
  bridgeAmountAtom,
  bridgeL2Atom,
  isBridgeWrappingAtom,
  selectedBridgeToken,
} from '../atoms'
import BridgeChainSelector from './BridgeChainSelector'

const chainContextAtom = atom((get) =>
  get(isBridgeWrappingAtom) ? get(bridgeL2Atom) : ChainId.Mainnet
)

const BridgeChain = () => {
  const isDeposit = useAtomValue(isBridgeWrappingAtom)

  return (
    <Box variant="layout.verticalAlign">
      <Text mr={2}>
        <Trans>To:</Trans>
      </Text>

      {isDeposit ? (
        <BridgeChainSelector />
      ) : (
        <>
          <ChainLogo chain={ChainId.Mainnet} />
          <Text ml="2">{CHAIN_TAGS[ChainId.Mainnet]}</Text>
        </>
      )}
    </Box>
  )
}

const BridgeTokenBalance = () => {
  const isWrapping = useAtomValue(isBridgeWrappingAtom)
  const wallet = useAtomValue(walletAtom)
  const selected = useAtomValue(selectedBridgeToken)
  const chain = useAtomValue(chainContextAtom)

  const balance = useBalance({
    address: wallet && chain ? wallet : undefined,
    token: isWrapping ? selected.L2contract : selected.L1contract,
    chainId: chain ?? undefined,
  })

  return (
    <Box variant="layout.verticalAlign" ml="auto">
      <Text variant="legend">Bal:</Text>
      <Text ml="2">
        {balance.data
          ? formatCurrency(Number(balance.data?.formatted), 5)
          : '0'}
      </Text>
    </Box>
  )
}

const BridgeOutputAmount = () => {
  const amount = useAtomValue(bridgeAmountAtom)

  return (
    <>
      <Text mr={2} sx={{ flexShrink: 0 }} variant="legend">
        Output:
      </Text>
      <Text
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        mr={3}
      >
        {Number(amount) ? formatCurrency(Number(amount)) : '--'}
      </Text>
    </>
  )
}

const BridgeOutputToken = () => {
  const isWrapping = useAtomValue(isBridgeWrappingAtom)
  const selected = useAtomValue(selectedBridgeToken)

  return (
    <Box ml="auto" sx={{ flexShrink: 0 }} variant="layout.verticalAlign">
      <TokenLogo src={isWrapping ? selected.L1icon : selected.L2icon} />
      <Text mx="2">{isWrapping ? selected.L1symbol : selected.L2symbol}</Text>
    </Box>
  )
}

const BridgeOutput = () => (
  <Card
    p={0}
    sx={{
      border: '1px solid',
      backgroundColor: 'transparent',
      borderColor: 'border',
      borderRadius: borderRadius.inputs,
    }}
  >
    <Box
      variant="layout.verticalAlign"
      p={3}
      sx={{ borderBottom: '1px solid', borderColor: 'border' }}
    >
      <BridgeChain />
      <BridgeTokenBalance />
    </Box>
    <Box p={3} variant="layout.verticalAlign">
      <BridgeOutputAmount />
      <BridgeOutputToken />
    </Box>
  </Card>
)

export default BridgeOutput
