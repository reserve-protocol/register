import BaseBridge from 'abis/BaseBridge'
import { atom } from 'jotai'
import { chainIdAtom, walletAtom } from 'state/atoms'
import { safeParseEther } from 'utils'
import atomWithDebounce from 'utils/atoms/atomWithDebounce'
import { ChainId } from 'utils/chains'
import { UsePrepareContractWriteConfig } from 'wagmi'
import {
  BRIDGEABLE_TOKENS,
  L1_BRIDGE_ADDRESS,
  L1_BRIDGE_TOKEN_ADDRESS,
  L2_BRIDGE_ADDRESS,
  L2_L1_MESSAGER_ADDRESS,
} from './utils/constants'

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
      args = [BRIDGEABLE_TOKENS[token].bridgedAddress, amount, 1000n, '0x01']
      functionName = 'withdraw'
    } else {
      address = L2_L1_MESSAGER_ADDRESS
      args = [wallet, 100000n, '0x01']
      functionName = 'initiateWithdrawal'
    }
  }

  return {
    address,
    functionName,
    value: !isWrapping && !token ? amount : undefined,
    abi: BaseBridge,
    args,
  } as UsePrepareContractWriteConfig
})
