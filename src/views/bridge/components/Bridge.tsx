import { Trans, t } from '@lingui/macro'
import BaseBridge from 'abis/BaseBridge'
import { Button, Card } from 'components'
import TransactionButton from 'components/button/TransactionButton'
import { chainIcons } from 'components/chain-selector/ChainSelector'
import useContractWrite from 'hooks/useContractWrite'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { ArrowRight } from 'react-feather'
import { chainIdAtom, walletAtom } from 'state/atoms'
import { Box, BoxProps, Divider, Select, Text } from 'theme-ui'
import { RSR_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'
import {
  Address,
  UsePrepareContractWriteConfig,
  useBalance,
  useSwitchNetwork,
} from 'wagmi'
import {
  bridgeAmountAtom,
  bridgeTokenAtom,
  isBridgeWrappingAtom,
  isValidBridgeAmountAtom,
} from '../atoms'
import TransactionInput, {
  TransactionInputProps,
} from 'components/transaction-input'
import { formatCurrency } from 'utils'
import useIsWindowVisible from 'hooks/useIsWindowVisible'

const BRIDGEABLE_TOKENS = [
  { symbol: 'ETH', address: '', bridgedAddress: '' },
  {
    symbol: 'RSR',
    address: RSR_ADDRESS[ChainId.Mainnet],
    bridgedAddress: RSR_ADDRESS[ChainId.Base],
  },
]

const Header = () => {
  const [isWrapping, setWrapping] = useAtom(isBridgeWrappingAtom)
  const { switchNetwork } = useSwitchNetwork()
  const isWindowVisible = useIsWindowVisible()
  const chainId = useAtomValue(chainIdAtom)

  // Trigger wallet switch for users
  useEffect(() => {
    if (switchNetwork && isWindowVisible) {
      if (isWrapping && chainId !== ChainId.Mainnet) {
        switchNetwork(ChainId.Mainnet)
      }

      if (!isWrapping && chainId === ChainId.Mainnet) {
        switchNetwork(ChainId.Base)
      }
    }
  }, [isWrapping, switchNetwork, isWindowVisible])

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

  const handleChange = (e: any) => {
    setToken(e.target.value)
  }

  return (
    <Box {...props}>
      <Select value={selected} onChange={handleChange}>
        {BRIDGEABLE_TOKENS.map((token, index) => (
          <option key={token.symbol} value={index.toString()}>
            {token.symbol}
          </option>
        ))}
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
  const token = Number(get(bridgeTokenAtom))
  const chainId = get(chainIdAtom)
  let address = token ? L1_BRIDGE_TOKEN_ADDRESS : L1_BRIDGE_ADDRESS
  let functionName = token ? 'depositERC20' : 'depositETH'
  let args: any[] = token
    ? [
        BRIDGEABLE_TOKENS[token].address,
        BRIDGEABLE_TOKENS[token].bridgedAddress,
        1000,
        '',
      ]
    : [1000, '']

  if (!isWrapping) {
    if (token) {
      address = L2_BRIDGE_ADDRESS
      functionName = 'withdraw'
    } else {
      address = L2_L1_MESSAGER_ADDRESS
      functionName = 'withdraw'
    }
  }

  if (
    (isWrapping && chainId !== ChainId.Mainnet) ||
    (!isWrapping && chainId !== ChainId.Base)
  ) {
    return undefined
  }

  return {
    address,
    functionName,
    abi: BaseBridge,
    args,
  } as UsePrepareContractWriteConfig
})

const selectedTokenAtom = atom(
  (get) => BRIDGEABLE_TOKENS[Number(get(bridgeTokenAtom))]
)

const BridgeAmount = (props: Partial<TransactionInputProps>) => {
  const chainId = useAtomValue(chainIdAtom)
  const token = useAtomValue(selectedTokenAtom)
  const account = useAtomValue(walletAtom)
  const [isValid, setValid] = useAtom(isValidBridgeAmountAtom)
  const { data } = useBalance({
    chainId,
    address: account || undefined,
    token: token.address
      ? ((chainId === ChainId.Mainnet
          ? token.address
          : token.bridgedAddress) as Address)
      : undefined,
  })

  useEffect(() => {}, [])

  return (
    <TransactionInput
      placeholder={t`Bridge amount`}
      amountAtom={bridgeAmountAtom}
      maxAmount={
        data ? formatCurrency(Number(data.formatted), 5) : 'Fetching...'
      }
      {...props}
    />
  )
}

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
      <BridgeAmount />
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
