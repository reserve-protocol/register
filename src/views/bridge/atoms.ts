import BaseBridge from 'abis/BaseBridge'
import { atom } from 'jotai'
import { chainIdAtom, walletAtom } from 'state/atoms'
import { safeParseEther } from 'utils'
import { RSR_ADDRESS } from 'utils/addresses'
import atomWithDebounce from 'utils/atoms/atomWithDebounce'
import { ChainId } from 'utils/chains'
import { UsePrepareContractWriteConfig } from 'wagmi'

const L1_BRIDGE_ADDRESS = '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e' // deposit eth
const L1_BRIDGE_TOKEN_ADDRESS = '0x3154Cf16ccdb4C6d922629664174b904d80F2C35' // deposit erc20
const L2_L1_MESSAGER_ADDRESS = '0x4200000000000000000000000000000000000016' // L2 withdraw native eth
const L2_BRIDGE_ADDRESS = '0x4200000000000000000000000000000000000010' // L2 withdraw erc20 token

export const BRIDGEABLE_TOKENS = [
  { symbol: 'ETH', address: '', bridgedAddress: '' },
  {
    symbol: 'RSR',
    address: RSR_ADDRESS[ChainId.Mainnet],
    bridgedAddress: RSR_ADDRESS[ChainId.Base],
  },
]

export const isBridgeWrappingAtom = atom(true)
export const bridgeTokenAtom = atom('0') // 0 => index for eth
export const selectedTokenAtom = atom(
  (get) => BRIDGEABLE_TOKENS[Number(get(bridgeTokenAtom))]
)

export const bridgeAmountAtom = atom('')
export const bridgeAmountDebouncedAtom = atomWithDebounce(
  atom((get) => get(bridgeAmountAtom)),
  500
).debouncedValueAtom

export const isValidBridgeAmountAtom = atom(false)

export const bridgeTxAtom = atom((get) => {
  const isWrapping = get(isBridgeWrappingAtom)
  const token = Number(get(bridgeTokenAtom))
  const chainId = get(chainIdAtom)
  const wallet = get(walletAtom)
  const amount = safeParseEther(get(bridgeAmountDebouncedAtom) || '0')
  const isValid = get(isValidBridgeAmountAtom)

  if (
    (isWrapping && chainId !== ChainId.Mainnet) ||
    (!isWrapping && chainId !== ChainId.Base) ||
    !isValid ||
    !wallet
  ) {
    return undefined
  }

  let address = token ? L1_BRIDGE_TOKEN_ADDRESS : L1_BRIDGE_ADDRESS
  let functionName = token ? 'depositERC20' : 'depositTransaction'
  let args: unknown[] = token
    ? [
        BRIDGEABLE_TOKENS[token].address,
        BRIDGEABLE_TOKENS[token].bridgedAddress,
        amount,
        1000n,
        '0x01',
      ]
    : [wallet, amount, 100000n, false, '0x01']

  if (!isWrapping) {
    if (token) {
      address = L2_BRIDGE_ADDRESS
      functionName = 'withdraw'
    } else {
      address = L2_L1_MESSAGER_ADDRESS
      functionName = 'withdraw'
    }
  }

  return {
    address,
    functionName,
    abi: BaseBridge,
    args,
  } as UsePrepareContractWriteConfig
})
