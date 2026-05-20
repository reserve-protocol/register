import type { DtfSdkProviderProps } from '@reserve-protocol/react-sdk'
import { arbitrum, base, bsc, mainnet } from 'wagmi/chains'

const infuraKey = import.meta.env.VITE_INFURA
const alchemyKey = import.meta.env.VITE_ALCHEMY
const ankrKey = import.meta.env.VITE_ANKR
const mainnetOverrideUrl = import.meta.env.VITE_MAINNET_URL

export const registerRpcUrls = {
  [mainnet.id]: mainnetOverrideUrl
    ? [mainnetOverrideUrl]
    : [
        'https://ethereum-rpc.publicnode.com/',
        'https://mainnet.gateway.tenderly.co/',
        ...(infuraKey ? [`https://mainnet.infura.io/v3/${infuraKey}`] : []),
        ...(alchemyKey
          ? [`https://eth-mainnet.alchemyapi.io/v2/${alchemyKey}`]
          : []),
        ...(ankrKey ? [`https://rpc.ankr.com/mainnet/${ankrKey}`] : []),
      ],
  [base.id]: [
    'https://base-rpc.publicnode.com',
    'https://base.gateway.tenderly.co',
    ...(infuraKey ? [`https://base-mainnet.infura.io/v3/${infuraKey}`] : []),
    ...(alchemyKey
      ? [`https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`]
      : []),
    ...(ankrKey ? [`https://rpc.ankr.com/base/${ankrKey}`] : []),
  ],
  [arbitrum.id]: [
    ...(infuraKey
      ? [`https://arbitrum-mainnet.infura.io/v3/${infuraKey}`]
      : []),
    ...(ankrKey ? [`https://rpc.ankr.com/arbitrum/${ankrKey}`] : []),
  ],
  [bsc.id]: [
    'https://bsc-dataseed2.binance.org',
    'https://bsc-dataseed3.ninicoin.io',
    'https://bsc-dataseed4.defibit.io',
    'https://bsc-rpc.publicnode.com',
    ...(infuraKey ? [`https://bsc-mainnet.infura.io/v3/${infuraKey}`] : []),
    ...(ankrKey ? [`https://rpc.ankr.com/bsc/${ankrKey}`] : []),
    ...(alchemyKey
      ? [`https://bsc-mainnet.g.alchemy.com/v2/${alchemyKey}`]
      : []),
  ],
} as const

export const dtfSdkChains = {
  [mainnet.id]: { rpcUrls: registerRpcUrls[mainnet.id] },
  [base.id]: { rpcUrls: registerRpcUrls[base.id] },
  [bsc.id]: { rpcUrls: registerRpcUrls[bsc.id] },
} as const satisfies DtfSdkProviderProps['chains']
