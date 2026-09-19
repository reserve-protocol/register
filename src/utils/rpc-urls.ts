import type { DtfSdkProviderProps } from '@reserve-protocol/react-sdk'
import { arbitrum, base, bsc, mainnet } from 'wagmi/chains'

const infuraKey = import.meta.env.VITE_INFURA
const alchemyKey = import.meta.env.VITE_ALCHEMY
const ankrKey = import.meta.env.VITE_ANKR
const mainnetOverrideUrl = import.meta.env.VITE_MAINNET_URL

// Per-chain override for local forks (fork e2e lane); VITE_MAINNET_URL is the
// older chain-1-only spelling and still wins there.
const overrideUrl = (chainId: number): string | undefined =>
  import.meta.env[`VITE_RPC_URL_${chainId}`] || undefined

const withOverride = (chainId: number, urls: string[]): string[] => {
  const override = overrideUrl(chainId)
  return override ? [override] : urls
}

export const registerRpcUrls = {
  [mainnet.id]: mainnetOverrideUrl
    ? [mainnetOverrideUrl]
    : withOverride(mainnet.id, [
        'https://ethereum-rpc.publicnode.com/',
        'https://mainnet.gateway.tenderly.co/',
        ...(infuraKey ? [`https://mainnet.infura.io/v3/${infuraKey}`] : []),
        ...(alchemyKey
          ? [`https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`]
          : []),
        ...(ankrKey ? [`https://rpc.ankr.com/eth/${ankrKey}`] : []),
      ]),
  [base.id]: withOverride(base.id, [
    'https://base-rpc.publicnode.com',
    'https://base.gateway.tenderly.co',
    ...(infuraKey ? [`https://base-mainnet.infura.io/v3/${infuraKey}`] : []),
    ...(alchemyKey
      ? [`https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`]
      : []),
    ...(ankrKey ? [`https://rpc.ankr.com/base/${ankrKey}`] : []),
  ]),
  [arbitrum.id]: [
    'https://arbitrum-one-rpc.publicnode.com',
    ...(infuraKey
      ? [`https://arbitrum-mainnet.infura.io/v3/${infuraKey}`]
      : []),
    ...(ankrKey ? [`https://rpc.ankr.com/arbitrum/${ankrKey}`] : []),
  ],
  [bsc.id]: withOverride(bsc.id, [
    'https://bsc-dataseed2.binance.org',
    'https://bsc-dataseed3.ninicoin.io',
    'https://bsc-dataseed4.defibit.io',
    'https://bsc-rpc.publicnode.com',
    ...(infuraKey ? [`https://bsc-mainnet.infura.io/v3/${infuraKey}`] : []),
    ...(ankrKey ? [`https://rpc.ankr.com/bsc/${ankrKey}`] : []),
    ...(alchemyKey
      ? [`https://bnb-mainnet.g.alchemy.com/v2/${alchemyKey}`]
      : []),
  ]),
} as const

// Same per-chain override the raw graphql callers use (fork e2e lane).
const indexSubgraphUrl = (chainId: number) => {
  const override = import.meta.env[`VITE_INDEX_SUBGRAPH_URL_${chainId}`]
  return override ? { indexSubgraphUrl: override as string } : {}
}

export const dtfSdkChains = {
  [mainnet.id]: {
    rpcUrls: registerRpcUrls[mainnet.id],
    ...indexSubgraphUrl(mainnet.id),
  },
  [base.id]: { rpcUrls: registerRpcUrls[base.id], ...indexSubgraphUrl(base.id) },
  [bsc.id]: { rpcUrls: registerRpcUrls[bsc.id], ...indexSubgraphUrl(bsc.id) },
} as const satisfies DtfSdkProviderProps['chains']
