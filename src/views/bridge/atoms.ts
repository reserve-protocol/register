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
import BRIDGE_ASSETS, { BridgeAsset } from './utils/assets'

export const bridgeTokensAtom = atom(BRIDGE_ASSETS)
export const selectedBridgeToken = atom<BridgeAsset>(BRIDGE_ASSETS[1]) // empty = ETH

export const isBridgeWrappingAtom = atom(true)
export const bridgeTokenAtom = atom('1') // 0 => index for eth
export const selectedTokenAtom = atom(
  (get) => BRIDGEABLE_TOKENS[Number(get(bridgeTokenAtom))]
)

export const bridgeAmountAtom = atom('')
export const bridgeAmountDebouncedAtom = atomWithDebounce(
  atom((get) => get(bridgeAmountAtom)),
  500
).debouncedValueAtom

export const maxBridgeAmountAtom = atom(0n)
export const isValidBridgeAmountAtom = atom((get) => {
  const max = get(maxBridgeAmountAtom)
  const amount = safeParseEther(get(bridgeAmountDebouncedAtom) || '0')

  return amount > 0n && amount <= max
})

export const bridgeTxAtom = atom((get) => {
  const isWrapping = get(isBridgeWrappingAtom)
  const token = get(selectedBridgeToken)
  const chainId = get(chainIdAtom)
  const wallet = get(walletAtom)
  const amount = safeParseEther(get(bridgeAmountDebouncedAtom) || '0')
  const isValid = get(isValidBridgeAmountAtom)

  console.log('tx')

  if (
    (isWrapping && chainId !== ChainId.Mainnet) ||
    (!isWrapping && chainId !== ChainId.Base) ||
    !isValid ||
    !wallet
  ) {
    return undefined
  }

  console.log('continuetx')

  let address = token.L1contract ? L1_BRIDGE_TOKEN_ADDRESS : L1_BRIDGE_ADDRESS
  let functionName = token.L1contract ? 'depositERC20' : 'depositTransaction'
  let args: unknown[] = token.L1contract
    ? [token.L1contract, token.L2contract, amount, 1000n, '0x01']
    : [wallet, amount, 100000n, false, '0x01']

  if (!isWrapping) {
    if (token.L2contract) {
      address = L2_BRIDGE_ADDRESS
      args = [token.L2contract, amount, 1000n, '0x01']
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
    value: !token.L1contract ? amount : undefined,
    abi: BaseBridge,
    args,
  } as UsePrepareContractWriteConfig
})
