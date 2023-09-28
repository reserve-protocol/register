import { Trans, t } from '@lingui/macro'
import { Button, Card } from 'components'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { chainIdAtom } from 'state/atoms'
import { Box, BoxProps, Divider, Select, Text } from 'theme-ui'
import { ChainId } from 'utils/chains'
import { UsePrepareContractWriteConfig, useSwitchNetwork } from 'wagmi'
import { bridgeTokenAtom, isBridgeWrappingAtom } from '../atoms'
import { chainIcons } from 'components/chain-selector/ChainSelector'
import { ArrowRight } from 'react-feather'
import { RSR_ADDRESS } from 'utils/addresses'
import TransactionButton from 'components/button/TransactionButton'
import useContractWrite from 'hooks/useContractWrite'
import L1StandardBridge from 'abis/L1StandardBridge'
import L2StandardBridge from 'abis/L2StandardBridge'
import L2ToL1MessagePasser from 'abis/L2ToL1MessagePasser'
import { Abi } from 'viem'

const Header = () => {
  const [isWrapping, setWrapping] = useAtom(isBridgeWrappingAtom)
  const { switchNetwork } = useSwitchNetwork()
  const chainId = useAtomValue(chainIdAtom)

  // Trigger wallet switch for users
  useEffect(() => {
    if (switchNetwork) {
      if (isWrapping && chainId !== ChainId.Mainnet) {
        switchNetwork(ChainId.Mainnet)
      }

      if (!isWrapping && chainId === ChainId.Mainnet) {
        switchNetwork(ChainId.Base)
      }
    }
  }, [isWrapping, switchNetwork])

  return (
    <>
      <Box variant="layout.verticalAlign">
        <Text as="h2" sx={{ fontSize: 3, fontWeight: 500 }}>
          <Trans>Bridge tokens</Trans>
        </Text>
        <Button
          variant="bordered"
          small
          sx={{ borderColor: isWrapping ? 'primary' : 'muted' }}
          ml="auto"
          onClick={() => setWrapping(true)}
        >
          <Trans>Deposit</Trans>
        </Button>
        <Button
          variant="bordered"
          ml="3"
          small
          sx={{ borderColor: !isWrapping ? 'primary' : 'muted' }}
          onClick={() => setWrapping(false)}
        >
          <Trans>Withdraw</Trans>
        </Button>
      </Box>
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
    </>
  )
}

const chains = {
  [ChainId.Mainnet]: { label: 'Ethereum' },
  [ChainId.Base]: { label: 'Base' },
}

const NetworkInfo = ({ id, label }: { id: number; label: string }) => (
  <Box variant="layout.verticalAlign">
    {chainIcons[id]({ fontSize: 20 })}
    <Box ml={2}>
      <Text variant="legend" sx={{ display: 'block' }}>
        {label}
      </Text>
      <Text>{chains[id].label}</Text>
    </Box>
  </Box>
)

const BridgeNetworkPreview = () => {
  const isWrapping = useAtomValue(isBridgeWrappingAtom)

  return (
    <Box>
      <Text>
        <Trans>Network</Trans>
      </Text>
      <Box mt={2} variant="layout.verticalAlign">
        <NetworkInfo
          id={isWrapping ? ChainId.Mainnet : ChainId.Base}
          label={t`From`}
        />
        <ArrowRight size={18} style={{ marginLeft: 16, marginRight: 16 }} />
        <NetworkInfo
          id={isWrapping ? ChainId.Base : ChainId.Mainnet}
          label={t`to`}
        />
      </Box>
    </Box>
  )
}

const BridgeTokenSelector = (props: BoxProps) => {
  const [selected, setToken] = useAtom(bridgeTokenAtom)
  const chainId = useAtomValue(chainIdAtom)

  const handleChange = (e: any) => {
    setToken(e.target.value)
  }

  return (
    <Box {...props}>
      <Select value={selected} onChange={handleChange}>
        <option value="">ETH</option>
        <option value={RSR_ADDRESS[chainId]}>RSR</option>
      </Select>
    </Box>
  )
}

const L1_BRIDGE_ADDRESS = '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e' // deposit eth
const L1_BRIDGE_TOKEN_ADDRESS = '0x3154Cf16ccdb4C6d922629664174b904d80F2C35' // deposit erc20
const L2_L1_MESSAGER_ADDRESS = '0x4200000000000000000000000000000000000016' // L2 withdraw native eth
const L2_BRIDGE_ADDRESS = '0x4200000000000000000000000000000000000010' // L2 withdraw erc20 token

const txAtom = atom((get) => {
  const isWrapping = get(isBridgeWrappingAtom)
  const token = get(bridgeTokenAtom)
  const chainId = get(chainIdAtom)
  let abi: Abi = L1StandardBridge
  let address = ''
  let functionName = ''

  if (!isWrapping) {
    abi = !!token ? L2StandardBridge : L2ToL1MessagePasser
  }

  if (
    (isWrapping && chainId !== ChainId.Mainnet) ||
    (!isWrapping && chainId !== ChainId.Base)
  ) {
    return undefined
  }

  return {
    address: '0x',
    functionName: 'test',
    abi,
    enabled: false,
  } as UsePrepareContractWriteConfig
})

const Bridge = () => {
  const { isReady, gas, write } = useContractWrite(useAtomValue(txAtom))

  return (
    <Card
      p={4}
      sx={{
        backgroundColor: 'contentBackground',
        height: 'fit-content',
      }}
    >
      <Header />
      <BridgeNetworkPreview />
      <BridgeTokenSelector mt={3} />
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
      <TransactionButton
        disabled={!isReady}
        gas={gas}
        onClick={write}
        text="Action"
        sx={{ width: '100%' }}
      />
    </Card>
  )
}

export default Bridge
