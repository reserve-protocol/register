import BaseBridge from 'abis/BaseBridge'
import { atom } from 'jotai'
import { chainIdAtom, walletAtom } from 'state/atoms'
import { formatCurrency, safeParseEther } from 'utils'
import atomWithDebounce from 'utils/atoms/atomWithDebounce'
import { ChainId } from 'utils/chains'
import { UsePrepareContractWriteConfig, erc20ABI } from 'wagmi'
import {
  L1_BRIDGE_ADDRESS,
  L1_BRIDGE_TOKEN_ADDRESS,
  L2_BRIDGE_ADDRESS,
  L2_L1_MESSAGER_ADDRESS,
} from './utils/constants'
import BRIDGE_ASSETS, { BridgeAsset } from './utils/assets'
import { atomWithLoadable } from 'utils/atoms/utils'
import { isWrappingAtom } from 'views/issuance/components/wrapping/atoms'
import { publicClient } from 'state/chain'
import { Address, ContractFunctionConfig, formatEther, formatUnits } from 'viem'

export const bridgeTokensAtom = atom(BRIDGE_ASSETS)
export const selectedBridgeToken = atom<BridgeAsset>(BRIDGE_ASSETS[1]) // default RSR

export const isBridgeWrappingAtom = atom(true)

export interface BridgeTokenDisplay {
  symbol: string
  name: string
  balance?: number
  formatted?: string
  logo: string
  asset: BridgeAsset
}

function mapAssets(
  assets: BridgeAsset[],
  isWrapping: boolean
): BridgeTokenDisplay[] {
  return assets.map((asset) => ({
    symbol: isWrapping ? asset.L1symbol : asset.L2symbol,
    name: isWrapping ? asset.L1name : asset.L2name,
    logo: isWrapping ? asset.L1icon : asset.L2icon,
    asset,
  }))
}

export const bridgeTokensSortedAtom = atomWithLoadable(async (get) => {
  const list = get(bridgeTokensAtom)
  const wallet = get(walletAtom)
  const isWrapping = get(isWrappingAtom)
  const chain = isWrapping ? ChainId.Mainnet : ChainId.Base
  const client = publicClient({ chainId: chain })

  if (wallet) {
    try {
      const contracts: ContractFunctionConfig[] = []

      for (const asset of list) {
        if (asset.L1contract && asset.L2contract) {
          contracts.push({
            address: isWrapping ? asset.L1contract : asset.L2contract,
            abi: erc20ABI,
            args: [wallet],
            functionName: 'balanceOf',
          })
        }
      }

      const result = await client.multicall({
        contracts,
      })
      const ethBalance = await client.getBalance({ address: wallet })

      // TODO: This is not a good sort because balances are not in the same units
      // TODO: Use oracles to get usd values? is it worth it?
      return list
        .map((asset, index) => {
          const balance = Number(
            index
              ? formatUnits(result[index - 1].result as bigint, asset.decimals)
              : formatEther(ethBalance)
          )

          return {
            symbol: isWrapping ? asset.L1symbol : asset.L2symbol,
            name: isWrapping ? asset.L1name : asset.L2name,
            logo: isWrapping ? asset.L1icon : asset.L2icon,
            balance,
            formatted: formatCurrency(balance, 5),
            asset,
          }
        })
        .sort(
          (a, b) => Number(b.balance) - Number(a.balance)
        ) as BridgeTokenDisplay[]
    } catch (e) {
      console.error('Error getting asset balances', e)
      return mapAssets(list, isWrapping)
    }
  }

  return mapAssets(list, isWrapping)
})

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

export const bridgeApprovalAtom = atom((get) => {
  const bridgeTransaction = get(bridgeTxAtom)
  const bridgeToken = get(selectedBridgeToken)
  const amount = get(bridgeAmountDebouncedAtom)
  const isWrapping = get(isBridgeWrappingAtom)

  if (!bridgeTransaction || !bridgeToken.L1contract || !isWrapping) {
    return undefined
  }

  return {
    token: isWrapping
      ? bridgeToken.L1contract
      : (bridgeToken.L2contract as Address),
    spender: bridgeTransaction.address as Address,
    amount: safeParseEther(amount),
  }
})

export const bridgeTxAtom = atom((get) => {
  const isWrapping = get(isBridgeWrappingAtom)
  const token = get(selectedBridgeToken)
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
