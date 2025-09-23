import { ChainId } from './chains'

export type NativeToken = {
  symbol: string
  name: string
  logo: string
  caip2: string
  coingeckoId?: string
  marketCap?: number
  price?: number
  priceChange7d?: number
}

export type Bridge = {
  id: string
  name: string
  url: string
  description: string
  logo: string
  risks: string[]
}

export type BridgedTokenMapping = {
  nativeKey: string
  bridgeId: string
  wrappedVersion?: boolean
}

export const NATIVE_TOKENS: Record<string, NativeToken> = {
  btc: {
    symbol: 'BTC',
    name: 'Bitcoin',
    caip2: 'bip122:000000000019d6689c085ae165831e93',
    logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    coingeckoId: 'bitcoin',
  },
  eth: {
    symbol: 'ETH',
    name: 'Ethereum',
    caip2: 'eip155:1',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    coingeckoId: 'ethereum',
  },
  xrp: {
    symbol: 'XRP',
    name: 'XRP',
    caip2: 'xrpl:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    coingeckoId: 'ripple',
  },
  bnb: {
    symbol: 'BNB',
    name: 'BNB',
    caip2: 'eip155:56',
    logo: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    coingeckoId: 'binancecoin',
  },
  sol: {
    symbol: 'SOL',
    name: 'Solana',
    caip2: 'solana:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    coingeckoId: 'solana',
  },
  doge: {
    symbol: 'DOGE',
    name: 'Dogecoin',
    caip2: 'dogecoin:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    coingeckoId: 'dogecoin',
  },
  trx: {
    symbol: 'TRX',
    name: 'TRON',
    caip2: 'tron:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/1094/standard/tron-logo.png?1696502193',
    coingeckoId: 'tron',
  },
  ada: {
    symbol: 'ADA',
    name: 'Cardano',
    caip2: 'cardano:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    coingeckoId: 'cardano',
  },
  link: {
    symbol: 'LINK',
    name: 'Chainlink',
    caip2: 'eip155:1',
    logo: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    coingeckoId: 'chainlink',
  },
  avax: {
    symbol: 'AVAX',
    name: 'Avalanche',
    caip2: 'eip155:43114',
    logo: 'https://assets.coingecko.com/coins/images/12559/large/coin-round-red.png',
    coingeckoId: 'avalanche-2',
  },
  sui: {
    symbol: 'SUI',
    name: 'Sui',
    caip2: 'sui:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/26375/standard/sui-ocean-square.png?1727791290',
    coingeckoId: 'sui',
  },
  xlm: {
    symbol: 'XLM',
    name: 'Stellar',
    caip2: 'stellar:public',
    logo: 'https://assets.coingecko.com/coins/images/100/large/Stellar_symbol_black_RGB.png',
    coingeckoId: 'stellar',
  },
  bch: {
    symbol: 'BCH',
    name: 'Bitcoin Cash',
    caip2: 'bitcoincash:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png',
    coingeckoId: 'bitcoin-cash',
  },
  hbar: {
    symbol: 'HBAR',
    name: 'Hedera',
    caip2: 'hedera:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/3688/large/hbar.png',
    coingeckoId: 'hedera-hashgraph',
  },
  ltc: {
    symbol: 'LTC',
    name: 'Litecoin',
    caip2: 'litecoin:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
    coingeckoId: 'litecoin',
  },
  ton: {
    symbol: 'TON',
    name: 'Toncoin',
    caip2: 'ton:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png',
    coingeckoId: 'the-open-network',
  },
  shib: {
    symbol: 'SHIB',
    name: 'Shiba Inu',
    caip2: 'eip155:1',
    logo: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
    coingeckoId: 'shiba-inu',
  },
  cro: {
    symbol: 'CRO',
    name: 'Cronos',
    caip2: 'eip155:25',
    logo: 'https://assets.coingecko.com/coins/images/7310/large/cro_token_logo.png',
    coingeckoId: 'crypto-com-chain',
  },
  dot: {
    symbol: 'DOT',
    name: 'Polkadot',
    caip2: 'polkadot:relay',
    logo: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
    coingeckoId: 'polkadot',
  },
  uni: {
    symbol: 'UNI',
    name: 'Uniswap',
    caip2: 'eip155:1',
    logo: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
    coingeckoId: 'uniswap',
  },
  hype: {
    symbol: 'HYPE',
    name: 'Hyperliquid',
    caip2: 'hyperliquid:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/50882/standard/hyperliquid.jpg?1729431300',
    coingeckoId: 'hyperliquid',
  },
  usdc: {
    symbol: 'USDC',
    name: 'USD Coin',
    caip2: 'eip155:1',
    logo: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
    coingeckoId: 'usd-coin',
  },
  usdt: {
    symbol: 'USDT',
    name: 'Tether',
    caip2: 'eip155:1',
    logo: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
    coingeckoId: 'tether',
  },
  dai: {
    symbol: 'DAI',
    name: 'Dai',
    caip2: 'eip155:1',
    logo: 'https://assets.coingecko.com/coins/images/9956/large/4943.png',
    coingeckoId: 'dai',
  },
  matic: {
    symbol: 'MATIC',
    name: 'Polygon',
    caip2: 'eip155:137',
    logo: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
    coingeckoId: 'polygon',
  },
  atom: {
    symbol: 'ATOM',
    name: 'Cosmos',
    caip2: 'cosmos:cosmoshub-4',
    logo: 'https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png',
    coingeckoId: 'cosmos',
  },
  near: {
    symbol: 'NEAR',
    name: 'NEAR Protocol',
    caip2: 'near:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/10365/large/near.jpg',
    coingeckoId: 'near-protocol',
  },
  algo: {
    symbol: 'ALGO',
    name: 'Algorand',
    caip2: 'algorand:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/4380/large/download.png',
    coingeckoId: 'algorand',
  },
  fil: {
    symbol: 'FIL',
    name: 'Filecoin',
    caip2: 'filecoin:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/12817/large/filecoin.png',
    coingeckoId: 'filecoin',
  },
  aave: {
    symbol: 'AAVE',
    name: 'Aave',
    caip2: 'eip155:1',
    logo: 'https://assets.coingecko.com/coins/images/12645/large/AAVE.png',
    coingeckoId: 'aave',
  },
  xmr: {
    symbol: 'XMR',
    name: 'Monero',
    caip2: 'monero:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/69/large/monero_logo.png',
    coingeckoId: 'monero',
  },
  mnt: {
    symbol: 'MNT',
    name: 'Mantle',
    caip2: 'eip155:5000',
    logo: 'https://assets.coingecko.com/coins/images/30980/large/token-logo.png',
    coingeckoId: 'mantle',
  },
  pepe: {
    symbol: 'PEPE',
    name: 'Pepe',
    caip2: 'eip155:1',
    logo: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg',
    coingeckoId: 'pepe',
  },
}

export const BRIDGES: Record<string, Bridge> = {
  wormhole: {
    id: 'wormhole',
    name: 'Wormhole',
    url: 'https://wormhole.com',
    description:
      'Cross-chain messaging protocol enabling token transfers across multiple blockchains',
    logo: 'https://storage.reserve.org/wormwhole.svg',
    risks: [
      'Smart contract risks - Bridges rely on smart contracts that could have vulnerabilities',
      'Custodial risks - Some bridges hold assets in a pool while issuing wrapped versions',
      'Liquidity concerns - Redemption mechanisms depend on the bridge infrastructure',
    ],
  },
  universal: {
    id: 'universal',
    name: 'Universal Protocol',
    url: 'https://universal.xyz',
    description:
      'Asset-backed token platform with 1:1 backing and Coinbase Custody',
    logo: 'https://storage.reserve.org/universal.svg',
    risks: [
      'Smart contract risk - Tokens are minted and burned using open-source smart contracts',
      'Custodial risks - A custodian holds the underlying asset with Coinbase Custody',
      'Liquidity risks - Redemptions rely on liquidity pools or merchant networks',
    ],
  },
  native_wrap: {
    id: 'native_wrap',
    name: 'Native Wrapped',
    url: '',
    description:
      'Native blockchain wrapped version (e.g., WBTC for BTC, WETH for ETH)',
    logo: '',
    risks: [
      'Smart contract risk - Wrapper contracts could have vulnerabilities',
      'Custodial risk - Underlying assets are held by the wrapper protocol',
    ],
  },
  bsc_bridge: {
    id: 'bsc_bridge',
    name: 'BSC Bridge',
    url: 'https://www.bnbchain.org/en/bridge',
    description:
      'Binance Smart Chain official bridge for cross-chain asset transfers',
    logo: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    risks: [
      'Centralization risk - Bridge operated by Binance',
      'Smart contract risk - Bridge contracts could have vulnerabilities',
      'Liquidity risk - Depends on BSC ecosystem liquidity',
    ],
  },
  stargate: {
    id: 'stargate',
    name: 'Stargate',
    url: 'https://stargate.finance',
    description: 'LayerZero-based omnichain liquidity transport protocol',
    logo: 'https://stargate.finance/static/logo.png',
    risks: [
      'Protocol risk - Depends on LayerZero messaging layer',
      'Liquidity risk - Requires sufficient liquidity in pools',
      'Smart contract risk - Complex cross-chain messaging system',
    ],
  },
  axelar: {
    id: 'axelar',
    name: 'Axelar',
    url: 'https://axelar.network',
    description: 'Decentralized cross-chain communication network',
    logo: 'https://axelar.network/logo.png',
    risks: [
      'Validator risk - Depends on Axelar validator network',
      'Bridge contract risk - Smart contracts on each chain',
      'Network risk - Cross-chain message delivery delays',
    ],
  },
}

export const BRIDGE_NATIVE_MAP: Record<
  number,
  Record<string, BridgedTokenMapping>
> = {
  [ChainId.Base]: {
    // Wormhole assets from Base
    '0x7fdaa50d7399ac436943028eda6ed9a1bd89509f': {
      nativeKey: 'btc',
      bridgeId: 'wormhole',
      wrappedVersion: true,
    },
    '0xfa1df3f6108db461fd89437f320fe50c125af5f0': {
      nativeKey: 'eth',
      bridgeId: 'wormhole',
      wrappedVersion: true,
    },
    '0x51436f6bd047797de7d11e9d32685f029aed1069': {
      nativeKey: 'usdc',
      bridgeId: 'wormhole',
    },
    '0xcb9eec5748aafa41fbcbe0b58465efed11ce176': {
      nativeKey: 'usdt',
      bridgeId: 'wormhole',
    },
    '0xf0134c5ea11d1fc75fa1b25fac00f8d82c38bd52': {
      nativeKey: 'dai',
      bridgeId: 'wormhole',
    },
    '0x224a0cb0c937018123b441b489a74eaf689da78f': {
      nativeKey: 'link',
      bridgeId: 'wormhole',
    },
    '0xdc1437d7390016af12fe501e4a65ec42d35469ce': {
      nativeKey: 'uni',
      bridgeId: 'wormhole',
    },
    '0x9a1da46efad9a87f68720b46c2777a9e3a5b4302': {
      nativeKey: 'aave',
      bridgeId: 'wormhole',
    },
    '0x781f50ea0dad22aee73e94bced1003f4cbd2bb5e': {
      nativeKey: 'shib',
      bridgeId: 'wormhole',
    },
    '0x417dbf0b8f24a1af0a2a4a76094b578c08f90a3d': {
      nativeKey: 'matic',
      bridgeId: 'wormhole',
    },
    // Universal assets from Base
    '0xf1143f3a8d76f1ca740d29d5671d365f66c44ed1': {
      nativeKey: 'btc',
      bridgeId: 'universal',
      wrappedVersion: true,
    },
    '0xd6a34b430c05ac78c24985f8abee2616bc1788cb': {
      nativeKey: 'eth',
      bridgeId: 'universal',
      wrappedVersion: true,
    },
    '0x0f813f4785b2360009f9ac9bf6121a85f109efc6': {
      nativeKey: 'sol',
      bridgeId: 'universal',
    },
    '0xd403d1624daef243fbcbd4a80d8a6f36affe32b2': {
      nativeKey: 'xrp',
      bridgeId: 'universal',
    },
    '0x7be0cc2cadcd4a8f9901b4a66244dcdd9bd02e0f': {
      nativeKey: 'ada',
      bridgeId: 'universal',
    },
    '0x5ed25e305e08f58afd7995eac72563e6be65a617': {
      nativeKey: 'doge',
      bridgeId: 'universal',
    },
    '0x378c326a472915d38b2d8d41e1345987835fab64': {
      nativeKey: 'trx',
      bridgeId: 'universal',
    },
    '0xb0505e5a99abd03d94a1169e638b78edfed26ea4': {
      nativeKey: 'bch',
      bridgeId: 'universal',
    },
    '0xa3a34a0d9a08ccddb6ed422ac0a28a06731335aa': {
      nativeKey: 'ltc',
      bridgeId: 'universal',
    },
    '0xc79e06860aa9564f95e08fb7e5b61458d0c63898': {
      nativeKey: 'xlm',
      bridgeId: 'universal',
    },
  },
  [ChainId.BSC]: {
    // CMC20 tokens on BSC
    '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c': {
      nativeKey: 'btc',
      bridgeId: 'bsc_bridge',
    },
    '0x2170ed0880ac9a755fd29b2688956bd959f933f8': {
      nativeKey: 'eth',
      bridgeId: 'bsc_bridge',
    },
    '0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe': {
      nativeKey: 'xrp',
      bridgeId: 'bsc_bridge',
    },
    '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c': {
      nativeKey: 'bnb',
      bridgeId: 'native_wrap',
      wrappedVersion: true,
    },
    '0x570a5d26f7765ecb712c0924e4de545b89fd43df': {
      nativeKey: 'sol',
      bridgeId: 'bsc_bridge',
    },
    '0xba2ae424d960c26247dd6c32edc70b295c744c43': {
      nativeKey: 'doge',
      bridgeId: 'bsc_bridge',
    },
    '0xce7de646e7208a4ef112cb6ed5038fa6cc6b12e3': {
      nativeKey: 'trx',
      bridgeId: 'bsc_bridge',
    },
    '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47': {
      nativeKey: 'ada',
      bridgeId: 'bsc_bridge',
    },
    '0xaed86a53a8f3dbba4fb6ae7a5f65f337c606bf28': {
      nativeKey: 'hype',
      bridgeId: 'bsc_bridge',
    },
    '0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd': {
      nativeKey: 'link',
      bridgeId: 'bsc_bridge',
    },
    '0x1ce0c2827e2ef14d5c4f29a091d735a204794041': {
      nativeKey: 'avax',
      bridgeId: 'bsc_bridge',
    },
    '0xd57f2e190c11cffc667aa5ad026cd4c8de0772a7': {
      nativeKey: 'sui',
      bridgeId: 'bsc_bridge',
    },
    '0x43c934a845205f0b514417d757d7235b8f53f1b9': {
      nativeKey: 'xlm',
      bridgeId: 'bsc_bridge',
    },
    '0x8ff795a6f4d97e7887c79bea79aba5cc76444adf': {
      nativeKey: 'bch',
      bridgeId: 'bsc_bridge',
    },
    '0x0422f966bf8e978075a97d47ef4c7efd3563fa51': {
      nativeKey: 'hbar',
      bridgeId: 'bsc_bridge',
    },
    '0x4338665cbb7b2485a8855a139b75d5e34ab0db94': {
      nativeKey: 'ltc',
      bridgeId: 'bsc_bridge',
    },
    '0x76a797a59ba2c17726896976b7b3747bfd1d220f': {
      nativeKey: 'ton',
      bridgeId: 'bsc_bridge',
    },
    '0x2859e4544c4bb03966803b044a93563bd2d0dd4d': {
      nativeKey: 'shib',
      bridgeId: 'bsc_bridge',
    },
    '0x757d4455e500cdd50c042b5b4af79c89e0a85396': {
      nativeKey: 'cro',
      bridgeId: 'bsc_bridge',
    },
    '0x7083609fce4d1d8dc0c979aab8c869ea2c873402': {
      nativeKey: 'dot',
      bridgeId: 'bsc_bridge',
    },
    '0xbf5140a22578168fd562dccf235e5d43a02ce9b1': {
      nativeKey: 'uni',
      bridgeId: 'bsc_bridge',
    },
  },
  [ChainId.Mainnet]: {
    // Add mainnet wrapped versions
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': {
      nativeKey: 'btc',
      bridgeId: 'native_wrap',
      wrappedVersion: true,
    },
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
      nativeKey: 'eth',
      bridgeId: 'native_wrap',
      wrappedVersion: true,
    },
  },
  [ChainId.Arbitrum]: {
    // Add Arbitrum bridged tokens as needed
  },
}

// Helper function to get native token for a bridged asset
export function getNativeToken(
  chainId: number,
  tokenAddress: string
): {
  native: NativeToken
  bridge: Bridge
  mapping: BridgedTokenMapping
} | null {
  const normalizedAddress = tokenAddress.toLowerCase()
  const chainMappings = BRIDGE_NATIVE_MAP[chainId]

  if (!chainMappings || !chainMappings[normalizedAddress]) {
    return null
  }

  const mapping = chainMappings[normalizedAddress]
  const native = NATIVE_TOKENS[mapping.nativeKey]
  const bridge = BRIDGES[mapping.bridgeId]

  if (!native || !bridge) {
    return null
  }

  return { native, bridge, mapping }
}

// Helper to group tokens by native asset
export function groupByNativeAsset(
  tokens: Array<{ address: string; symbol: string; weight: number }>,
  chainId: number
): Map<
  string,
  { native: NativeToken; tokens: Array<any>; totalWeight: number }
> {
  const groups = new Map()

  for (const token of tokens) {
    const nativeInfo = getNativeToken(chainId, token.address)
    const key = nativeInfo ? nativeInfo.native.symbol : token.symbol

    if (!groups.has(key)) {
      groups.set(key, {
        native: nativeInfo?.native || null,
        tokens: [],
        totalWeight: 0,
      })
    }

    const group = groups.get(key)
    group.tokens.push({ ...token, bridge: nativeInfo?.bridge })
    group.totalWeight += token.weight
  }

  return groups
}
