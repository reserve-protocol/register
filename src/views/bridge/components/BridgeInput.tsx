import { Trans } from '@lingui/macro'
import { Button, NumericalInput } from 'components'
import ChainLogo from 'components/icons/ChainLogo'
import TokenLogo from 'components/icons/TokenLogo'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { ChevronDown } from 'react-feather'
import { walletAtom } from 'state/atoms'
import { borderRadius } from 'theme'
import { Box, Flex, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { ChainId } from 'utils/chains'
import { CHAIN_TAGS } from 'utils/constants'
import { useBalance } from 'wagmi'
import {
  bridgeAmountAtom,
  isBridgeWrappingAtom,
  maxBridgeAmountAtom,
  selectedBridgeToken,
} from '../atoms'
import BridgeTokenModal from './BridgeTokenModal'

const chainContextAtom = atom((get) =>
  get(isBridgeWrappingAtom) ? ChainId.Mainnet : ChainId.Base
)

const BridgeTokenBalance = () => {
  const isWrapping = useAtomValue(isBridgeWrappingAtom)
  const wallet = useAtomValue(walletAtom)
  const selected = useAtomValue(selectedBridgeToken)
  const chain = useAtomValue(chainContextAtom)
  const setAmount = useSetAtom(bridgeAmountAtom)
  const setMax = useSetAtom(maxBridgeAmountAtom)

  const balance = useBalance({
    address: wallet ?? undefined,
    token: isWrapping ? selected.L1contract : selected.L2contract,
    chainId: chain,
  })

  useEffect(() => {
    if (balance.data?.value) {
      setMax(balance.data.value)
    } else {
      setMax(0n)
    }
  }, [balance.data?.value])

  return (
    <Box variant="layout.verticalAlign" ml="auto">
      <Text variant="legend" sx={{ display: ['none', 'block'] }}>
        Bal:
      </Text>
      <Text ml="2" sx={{ display: ['none', 'block'] }}>
        {balance.data
          ? formatCurrency(Number(balance.data?.formatted), 5)
          : '0'}
      </Text>
      <Button
        small
        variant="muted"
        ml={3}
        onClick={() => setAmount(balance.data?.formatted ?? '0')}
      >
        Max
      </Button>
    </Box>
  )
}

const BridgeChain = () => {
  const chain = useAtomValue(chainContextAtom)

  return (
    <Box variant="layout.verticalAlign" mr={3}>
      <Text mr={2}>
        <Trans>From:</Trans>
      </Text>

      <ChainLogo chain={chain} />
      <Text ml="2">{CHAIN_TAGS[chain]}</Text>
    </Box>
  )
}

const BridgeAmount = () => {
  const isWrapping = useAtomValue(isBridgeWrappingAtom)
  const [amount, setAmount] = useAtom(bridgeAmountAtom)

  return (
    <NumericalInput
      p={3}
      sx={{
        border: 'none',
        backgroundColor: 'focusedBackground',
        borderRadius: borderRadius.inputs,
        '&:focus': {
          backgroundColor: 'focusedBackground',
        },
      }}
      placeholder={`${isWrapping ? 'Deposit' : 'Withdraw'} amount`}
      value={amount}
      onChange={setAmount}
    />
  )
}

const BridgeTokenSelector = () => {
  const isWrapping = useAtomValue(isBridgeWrappingAtom)
  const selected = useAtomValue(selectedBridgeToken)
  const [isSelecting, setSelecting] = useState(false)

  return (
    <>
      {isSelecting && <BridgeTokenModal onClose={() => setSelecting(false)} />}
      <Box
        ml="auto"
        role="button"
        sx={{ cursor: 'pointer', flexShrink: 0 }}
        variant="layout.verticalAlign"
        onClick={() => setSelecting(true)}
        p={3}
        pr={4}
      >
        <TokenLogo src={isWrapping ? selected.L1icon : selected.L2icon} />
        <Text mx="2">{isWrapping ? selected.L1symbol : selected.L2symbol}</Text>
        <ChevronDown size={16} />
      </Box>
    </>
  )
}

const BridgeInput = () => (
  <Box
    sx={{
      borderRadius: borderRadius.inputs,
      border: '1px solid',
      borderColor: 'inputBorder',
      backgroundColor: 'focusedBackground',
      boxShadow: '0px 6px 16px rgba(0,0,0,0.05)',
      flexShrink: 0,
    }}
  >
    <Flex
      sx={{
        borderBottom: '1px solid',
        flexWrap: 'wrap',
        borderColor: 'inputBorder',
      }}
      p={3}
    >
      <BridgeChain />
      <BridgeTokenBalance />
    </Flex>
    <Box variant="layout.verticalAlign">
      <BridgeAmount />
      <BridgeTokenSelector />
    </Box>
  </Box>
)

export default BridgeInput
