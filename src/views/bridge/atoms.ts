import BaseBridge from 'abis/BaseBridge'
import { atom } from 'jotai'
import { chainIdAtom, walletAtom } from 'state/atoms'
import { wagmiConfig } from 'state/chain'
import { formatCurrency, safeParseEther } from 'utils'
import atomWithDebounce from 'utils/atoms/atomWithDebounce'
import { atomWithLoadable } from 'utils/atoms/utils'
import { AvailableChain, ChainId } from 'utils/chains'
import { CHAIN_TAGS, supportedChainList } from 'utils/constants'
import { Address, erc20Abi, formatEther, formatUnits } from 'viem'
import { getBalance, readContracts } from 'wagmi/actions'
import BRIDGE_ASSETS, { BridgeAsset } from './utils/assets'
import {
  L1_BRIDGE_ADDRESS,
  L1_BRIDGE_TOKEN_ADDRESS,
  L2_BRIDGE_ADDRESS,
  L2_L1_MESSAGER_ADDRESS,
} from './utils/constants'

const defaultBridgeAsset =
  typeof window !== 'undefined'
    ? (new URL(window.location.href).searchParams.get('asset') ?? 'rsr')
    : 'rsr'
const defaultL2 =
  typeof window !== 'undefined'
    ? (new URL(window.location.href).searchParams.get('l2') ?? null)
    : null

const defaultChain =
  defaultL2 && supportedChainList.find((chain) => chain === Number(defaultL2))
    ? Number(defaultL2)
    : ChainId.Base
// Default to RSR Base (it will change as soon as they select a network)
const defaultToken = defaultChain
  ? BRIDGE_ASSETS[defaultChain].find(
      (asset) =>
        asset.L1symbol.toLowerCase() === defaultBridgeAsset.toLowerCase()
    ) || BRIDGE_ASSETS[ChainId.Base][1]
  : BRIDGE_ASSETS[ChainId.Base][1]

export const bridgeL2Atom = atom<number>(defaultChain)
export const bridgeTokensAtom = atom((get) => {
  const chain = get(bridgeL2Atom)

  if (!chain) {
    return BRIDGE_ASSETS[ChainId.Base].slice(0, 2)
  }

  return BRIDGE_ASSETS[chain]
})
export const selectedBridgeToken = atom<BridgeAsset>(defaultToken) // default RSR

export const isBridgeWrappingAtom = atom(true)

export const btnLabelAtom = atom((get) => {
  const token = get(selectedBridgeToken)
  const l2 = get(bridgeL2Atom)
  const isWrapping = get(isBridgeWrappingAtom)

  return `${isWrapping ? 'Deposit' : 'Withdraw'} ${
    isWrapping ? token.L1symbol : token.L2symbol
  } to ${isWrapping ? CHAIN_TAGS[l2] : 'Ethereum'}`
})

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
  const isWrapping = get(isBridgeWrappingAtom)
  const l2Chain = get(bridgeL2Atom)
  const chain = (isWrapping ? ChainId.Mainnet : l2Chain) as AvailableChain

  if (wallet) {
    try {
      const contracts: {
        address: Address
        abi: typeof erc20Abi
        args: [Address]
        functionName: 'balanceOf'
        chainId: AvailableChain
      }[] = []

      for (const asset of list) {
        if (asset.L1contract && asset.L2contract) {
          contracts.push({
            address: isWrapping ? asset.L1contract : asset.L2contract,
            abi: erc20Abi,
            args: [wallet],
            functionName: 'balanceOf',
            chainId: chain as AvailableChain,
          })
        }
      }

      const result = await readContracts(wagmiConfig, {
        contracts: contracts,
      })
      const { value: ethBalance } = await getBalance(wagmiConfig, {
        address: wallet,
        chainId: chain,
      })

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

  let address: Address = token.L1contract
    ? L1_BRIDGE_TOKEN_ADDRESS
    : L1_BRIDGE_ADDRESS
  let functionName:
    | 'withdraw'
    | 'initiateWithdrawal'
    | 'depositERC20'
    | 'depositTransaction' = token.L1contract
    ? 'depositERC20'
    : 'depositTransaction'
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
  }
})
