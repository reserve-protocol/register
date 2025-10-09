import { ChainId } from './chains'

export type NativeToken = {
  symbol: string
  name: string
  address?: string
  logo: string
  caip2: string
  url?: string // CoinMarketCap URL for reference
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
  symbol?: string // Optional for readability, shows the asset symbol
  wrappedVersion?: boolean
}

export const NATIVE_TOKENS: Record<string, NativeToken> = {
  arb: {
    symbol: 'ARB',
    name: 'Arbitrum',
    caip2: 'eip155:42161',
    logo: 'https://assets.coingecko.com/coins/images/16547/standard/arb.jpg?1721358242',
    url: 'https://coinmarketcap.com/currencies/arbitrum/',
    coingeckoId: 'arbitrum',
  },
  btc: {
    symbol: 'BTC',
    name: 'Bitcoin',
    caip2: 'bip122:000000000019d6689c085ae165831e93',
    logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    url: 'https://coinmarketcap.com/currencies/bitcoin/',
    coingeckoId: 'bitcoin',
  },
  eth: {
    symbol: 'ETH',
    name: 'Ethereum',
    caip2: 'eip155:1',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    url: 'https://coinmarketcap.com/currencies/ethereum/',
    coingeckoId: 'ethereum',
  },
  ena: {
    symbol: 'ENA',
    name: 'Ethena',
    caip2: 'eip155:1',
    logo: 'https://assets.coingecko.com/coins/images/36530/standard/ethena.png?1711701436',
    url: 'https://coinmarketcap.com/currencies/ethena/',
    coingeckoId: 'ethena',
  },
  xrp: {
    symbol: 'XRP',
    name: 'XRP',
    caip2: 'xrpl:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    url: 'https://coinmarketcap.com/currencies/xrp/',
    coingeckoId: 'ripple',
  },
  bnb: {
    symbol: 'BNB',
    name: 'BNB',
    caip2: 'eip155:56',
    logo: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    url: 'https://coinmarketcap.com/currencies/bnb/',
    coingeckoId: 'binancecoin',
  },
  sol: {
    symbol: 'SOL',
    name: 'Solana',
    caip2: 'solana:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    url: 'https://coinmarketcap.com/currencies/solana/',
    coingeckoId: 'solana',
  },
  doge: {
    symbol: 'DOGE',
    name: 'Dogecoin',
    caip2: 'dogecoin:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    url: 'https://coinmarketcap.com/currencies/dogecoin/',
    coingeckoId: 'dogecoin',
  },
  trx: {
    symbol: 'TRX',
    name: 'TRON',
    caip2: 'tron:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/1094/standard/tron-logo.png?1696502193',
    url: 'https://coinmarketcap.com/currencies/tron/',
    coingeckoId: 'tron',
  },
  ada: {
    symbol: 'ADA',
    name: 'Cardano',
    caip2: 'cardano:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    url: 'https://coinmarketcap.com/currencies/cardano/',
    coingeckoId: 'cardano',
  },
  link: {
    symbol: 'LINK',
    name: 'Chainlink',
    caip2: 'eip155:1',
    logo: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    url: 'https://coinmarketcap.com/currencies/chainlink/',
    coingeckoId: 'chainlink',
    address: '0x514910771af9ca656af840dff83e8264ecf986ca',
  },
  avax: {
    symbol: 'AVAX',
    name: 'Avalanche',
    caip2: 'eip155:43114',
    logo: 'https://assets.coingecko.com/coins/images/12559/large/coin-round-red.png',
    url: 'https://coinmarketcap.com/currencies/avalanche/',
    coingeckoId: 'avalanche-2',
  },
  sui: {
    symbol: 'SUI',
    name: 'Sui',
    caip2: 'sui:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/26375/standard/sui-ocean-square.png?1727791290',
    url: 'https://coinmarketcap.com/currencies/sui/',
    coingeckoId: 'sui',
  },
  xlm: {
    symbol: 'XLM',
    name: 'Stellar',
    caip2: 'stellar:public',
    logo: 'https://assets.coingecko.com/coins/images/100/large/Stellar_symbol_black_RGB.png',
    url: 'https://coinmarketcap.com/currencies/stellar/',
    coingeckoId: 'stellar',
  },
  bch: {
    symbol: 'BCH',
    name: 'Bitcoin Cash',
    caip2: 'bitcoincash:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png',
    url: 'https://coinmarketcap.com/currencies/bitcoin-cash/',
    coingeckoId: 'bitcoin-cash',
  },
  hbar: {
    symbol: 'HBAR',
    name: 'Hedera',
    caip2: 'hedera:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/3688/large/hbar.png',
    url: 'https://coinmarketcap.com/currencies/hedera/',
    coingeckoId: 'hedera-hashgraph',
  },
  ltc: {
    symbol: 'LTC',
    name: 'Litecoin',
    caip2: 'litecoin:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
    url: 'https://coinmarketcap.com/currencies/litecoin/',
    coingeckoId: 'litecoin',
  },
  ton: {
    symbol: 'TON',
    name: 'Toncoin',
    caip2: 'ton:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png',
    url: 'https://coinmarketcap.com/currencies/toncoin/',
    coingeckoId: 'the-open-network',
  },
  shib: {
    symbol: 'SHIB',
    name: 'Shiba Inu',
    caip2: 'eip155:1',
    logo: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
    url: 'https://coinmarketcap.com/currencies/shiba-inu/',
    coingeckoId: 'shiba-inu',
  },
  cro: {
    symbol: 'CRO',
    name: 'Cronos',
    caip2: 'eip155:25',
    logo: 'https://assets.coingecko.com/coins/images/7310/large/cro_token_logo.png',
    url: 'https://coinmarketcap.com/currencies/cronos/',
    coingeckoId: 'crypto-com-chain',
  },
  dot: {
    symbol: 'DOT',
    name: 'Polkadot',
    caip2: 'polkadot:relay',
    logo: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
    url: 'https://coinmarketcap.com/currencies/polkadot-new/',
    coingeckoId: 'polkadot',
  },
  uni: {
    symbol: 'UNI',
    name: 'Uniswap',
    caip2: 'eip155:1',
    logo: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
    url: 'https://coinmarketcap.com/currencies/uniswap/',
    coingeckoId: 'uniswap',
  },
  hype: {
    symbol: 'HYPE',
    name: 'Hyperliquid',
    caip2: 'hyperliquid:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/50882/standard/hyperliquid.jpg?1729431300',
    url: 'https://coinmarketcap.com/currencies/hyperliquid/',
    coingeckoId: 'hyperliquid',
  },
  usdc: {
    symbol: 'USDC',
    name: 'USD Coin',
    caip2: 'eip155:1',
    logo: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
    url: 'https://coinmarketcap.com/currencies/usd-coin/',
    coingeckoId: 'usd-coin',
  },
  usdt: {
    symbol: 'USDT',
    name: 'Tether',
    caip2: 'eip155:1',
    logo: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
    url: 'https://coinmarketcap.com/currencies/tether/',
    coingeckoId: 'tether',
  },
  dai: {
    symbol: 'DAI',
    name: 'Dai',
    caip2: 'eip155:1',
    logo: 'https://assets.coingecko.com/coins/images/9956/large/4943.png',
    url: 'https://coinmarketcap.com/currencies/multi-collateral-dai/',
    coingeckoId: 'dai',
  },
  matic: {
    symbol: 'MATIC',
    name: 'Polygon',
    caip2: 'eip155:137',
    logo: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
    url: 'https://coinmarketcap.com/currencies/polygon-ecosystem-token/',
    coingeckoId: 'polygon',
  },
  atom: {
    symbol: 'ATOM',
    name: 'Cosmos',
    caip2: 'cosmos:cosmoshub-4',
    logo: 'https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png',
    url: 'https://coinmarketcap.com/currencies/cosmos/',
    coingeckoId: 'cosmos',
  },
  near: {
    symbol: 'NEAR',
    name: 'NEAR Protocol',
    caip2: 'near:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/10365/large/near.jpg',
    url: 'https://coinmarketcap.com/currencies/near-protocol/',
    coingeckoId: 'near-protocol',
  },
  algo: {
    symbol: 'ALGO',
    name: 'Algorand',
    caip2: 'algorand:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/4380/large/download.png',
    url: 'https://coinmarketcap.com/currencies/algorand/',
    coingeckoId: 'algorand',
  },
  fil: {
    symbol: 'FIL',
    name: 'Filecoin',
    caip2: 'filecoin:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/12817/large/filecoin.png',
    url: 'https://coinmarketcap.com/currencies/filecoin/',
    coingeckoId: 'filecoin',
  },
  aave: {
    symbol: 'AAVE',
    name: 'Aave',
    caip2: 'eip155:1',
    logo: 'https://assets.coingecko.com/coins/images/12645/large/AAVE.png',
    url: 'https://coinmarketcap.com/currencies/aave/',
    coingeckoId: 'aave',
  },
  xmr: {
    symbol: 'XMR',
    name: 'Monero',
    caip2: 'monero:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/69/large/monero_logo.png',
    url: 'https://coinmarketcap.com/currencies/monero/',
    coingeckoId: 'monero',
  },
  mnt: {
    symbol: 'MNT',
    name: 'Mantle',
    caip2: 'eip155:5000',
    logo: 'https://assets.coingecko.com/coins/images/30980/large/token-logo.png',
    url: 'https://coinmarketcap.com/currencies/mantle/',
    coingeckoId: 'mantle',
  },
  pepe: {
    symbol: 'PEPE',
    name: 'Pepe',
    caip2: 'eip155:1',
    logo: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg',
    url: 'https://coinmarketcap.com/currencies/pepe/',
    coingeckoId: 'pepe',
  },
  // Additional tokens for Universal and Wormhole bridges
  vet: {
    symbol: 'VET',
    name: 'VeChain',
    caip2: 'vechain:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/1167/large/VET_Token_Icon.png',
    url: 'https://coinmarketcap.com/currencies/vechain/',
    coingeckoId: 'vechain',
  },
  theta: {
    symbol: 'THETA',
    name: 'Theta Network',
    caip2: 'theta:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/2538/large/theta-token-logo.png',
    url: 'https://coinmarketcap.com/currencies/theta-network/',
    coingeckoId: 'theta-token',
  },
  eos: {
    symbol: 'EOS',
    name: 'EOS',
    caip2: 'eos:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/738/large/eos-eos-logo.png',
    url: 'https://coinmarketcap.com/currencies/eos/',
    coingeckoId: 'eos',
  },
  kas: {
    symbol: 'KAS',
    name: 'Kaspa',
    caip2: 'kaspa:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/25751/large/kaspa-icon-exchanges.png',
    url: 'https://coinmarketcap.com/currencies/kaspa/',
    coingeckoId: 'kaspa',
  },
  zec: {
    symbol: 'ZEC',
    name: 'Zcash',
    caip2: 'zcash:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/486/large/circle-zcash-color.png',
    url: 'https://coinmarketcap.com/currencies/zcash/',
    coingeckoId: 'zcash',
  },
  xdc: {
    symbol: 'XDC',
    name: 'XDC Network',
    caip2: 'xdc:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/2912/large/xdc-icon.png',
    url: 'https://coinmarketcap.com/currencies/xdc-network/',
    coingeckoId: 'xdce-crowd-sale',
  },
  dash: {
    symbol: 'DASH',
    name: 'Dash',
    caip2: 'dash:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/19/large/dash-logo.png',
    url: 'https://coinmarketcap.com/currencies/dash/',
    coingeckoId: 'dash',
  },
  qtum: {
    symbol: 'QTUM',
    name: 'Qtum',
    caip2: 'qtum:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/684/large/qtum.png',
    url: 'https://coinmarketcap.com/currencies/qtum/',
    coingeckoId: 'qtum',
  },
  nano: {
    symbol: 'XNO',
    name: 'Nano',
    caip2: 'nano:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/756/large/nano.png',
    url: 'https://coinmarketcap.com/currencies/nano/',
    coingeckoId: 'nano',
  },
  btg: {
    symbol: 'BTG',
    name: 'Bitcoin Gold',
    caip2: 'btg:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/1043/large/bitcoin-gold-logo.png',
    url: 'https://coinmarketcap.com/currencies/bitcoin-gold/',
    coingeckoId: 'bitcoin-gold',
  },
  etc: {
    symbol: 'ETC',
    name: 'Ethereum Classic',
    caip2: 'eip155:61',
    logo: 'https://assets.coingecko.com/coins/images/453/large/ethereum-classic-logo.png',
    url: 'https://coinmarketcap.com/currencies/ethereum-classic/',
    coingeckoId: 'ethereum-classic',
  },
  apt: {
    symbol: 'APT',
    name: 'Aptos',
    caip2: 'aptos:mainnet',
    logo: 'https://assets.coingecko.com/coins/images/26455/standard/aptos_round.png?1696525528',
    url: 'https://coinmarketcap.com/currencies/aptos/',
    coingeckoId: 'aptos',
  },
  okb: {
    symbol: 'OKB',
    name: 'OKB',
    caip2: 'eip155:66',
    logo: 'https://assets.coingecko.com/coins/images/4463/standard/WeChat_Image_20220118095654.png?1696505053',
    url: 'https://coinmarketcap.com/currencies/okb/',
    coingeckoId: 'okb',
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
  coinbase: {
    id: 'coinbase',
    name: 'Coinbase',
    url: 'https://www.coinbase.com',
    description:
      'Coinbase Wrapped Bitcoin - institutional-grade wrapped Bitcoin on Base',
    logo: 'https://assets.coingecko.com/coins/images/39847/large/cbBTC.jpg',
    risks: [
      'Custodial risk - Bitcoin is held by Coinbase Custody',
      'Smart contract risk - cbBTC contract implementation',
      'Centralization risk - Depends on Coinbase as the issuer',
    ],
  },
}

/**
 * Bridge to native token mappings for different chains
 * Maps bridged token addresses to their native counterparts
 * Last verified: September 2025
 *
 * Important: Always verify token addresses on respective block explorers
 * Base: https://basescan.org
 * BSC: https://bscscan.com
 * Ethereum: https://etherscan.io
 */
export const BRIDGE_NATIVE_MAP: Record<
  number,
  Record<string, BridgedTokenMapping>
> = {
  [ChainId.Base]: {
    // WETH - Canonical wrapped ETH on Base
    '0x4200000000000000000000000000000000000006': {
      nativeKey: 'eth',
      bridgeId: 'native_wrap',
      symbol: 'WETH',
      wrappedVersion: true,
    },
    // cbBTC - Coinbase Wrapped Bitcoin (Verified: 382,756 holders)
    '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf': {
      nativeKey: 'btc',
      bridgeId: 'coinbase',
      symbol: 'cbBTC',
      wrappedVersion: true,
    },
    '0x7fdaa50d7399ac436943028eda6ed9a1bd89509f': {
      nativeKey: 'btc',
      bridgeId: 'wormhole',
      symbol: 'WBTC',
      wrappedVersion: true,
    },
    '0xfa1df3f6108db461fd89437f320fe50c125af5f0': {
      nativeKey: 'eth',
      bridgeId: 'wormhole',
      symbol: 'WETH',
      wrappedVersion: true,
    },
    '0x51436f6bd047797de7d11e9d32685f029aed1069': {
      nativeKey: 'ton',
      bridgeId: 'wormhole',
      symbol: 'TON',
    },
    '0xcb9eec5748aafa41fbcbe0b58465efed11ce176': {
      nativeKey: 'usdt',
      bridgeId: 'wormhole',
      symbol: 'USDT',
    },
    '0xf0134c5ea11d1fc75fa1b25fac00f8d82c38bd52': {
      nativeKey: 'dai',
      bridgeId: 'wormhole',
      symbol: 'DAI',
    },
    '0x224a0cb0c937018123b441b489a74eaf689da78f': {
      nativeKey: 'link',
      bridgeId: 'wormhole',
      symbol: 'LINK',
    },
    '0xdc1437d7390016af12fe501e4a65ec42d35469ce': {
      nativeKey: 'uni',
      bridgeId: 'wormhole',
      symbol: 'UNI',
    },
    '0x9a1da46efad9a87f68720b46c2777a9e3a5b4302': {
      nativeKey: 'aave',
      bridgeId: 'wormhole',
      symbol: 'AAVE',
    },
    '0x781f50ea0dad22aee73e94bced1003f4cbd2bb5e': {
      nativeKey: 'okb',
      bridgeId: 'wormhole',
      symbol: 'OKB',
    },
    '0x417dbf0b8f24a1af0a2a4a76094b578c08f90a3d': {
      nativeKey: 'matic',
      bridgeId: 'wormhole',
      symbol: 'MATIC',
    },
    '0x10f4799f0feeea0e74454e0b6669d3c0cf7b93bf': {
      nativeKey: 'avax',
      bridgeId: 'wormhole',
      symbol: 'AVAX',
    },
    '0x55b3e31739247d010ece7ddc365eae512b16fa7e': {
      nativeKey: 'ena',
      bridgeId: 'wormhole',
      symbol: 'ENA',
    },
    '0x5b0a82456d018f21881d1d5460e37aefd56d54b3': {
      nativeKey: 'atom',
      bridgeId: 'wormhole',
      symbol: 'ATOM',
    },
    '0xf905b22e30743dc07d8ed7fdf0ef0f5ec76e52be': {
      nativeKey: 'near',
      bridgeId: 'wormhole',
      symbol: 'NEAR',
    },
    '0x6ad49f3bd3e15a7ee14a3b246824858e97910ed0': {
      nativeKey: 'algo',
      bridgeId: 'wormhole',
      symbol: 'ALGO',
    },
    '0xb0bb1cae834d533d7b75300f4f818ef3ef8a18b8': {
      nativeKey: 'fil',
      bridgeId: 'wormhole',
      symbol: 'FIL',
    },
    '0x4c5d8a75f3762c1561d96f177694f67378705e98': {
      nativeKey: 'xmr',
      bridgeId: 'wormhole',
      symbol: 'XMR',
    },
    '0xa76a29923ccfb59e734e907688b659e48a55fd07': {
      nativeKey: 'mnt',
      bridgeId: 'wormhole',
      symbol: 'MNT',
    },
    '0x3992b27da26848c2b19cea6fd25ad5568b68ab98': {
      nativeKey: 'pepe',
      bridgeId: 'wormhole',
      symbol: 'PEPE',
    },
    '0xf1143f3a8d76f1ca740d29d5671d365f66c44ed1': {
      nativeKey: 'btc',
      bridgeId: 'universal',
      symbol: 'uBTC',
      wrappedVersion: true,
    },
    '0xd6a34b430c05ac78c24985f8abee2616bc1788cb': {
      nativeKey: 'eth',
      bridgeId: 'universal',
      symbol: 'uETH',
      wrappedVersion: true,
    },
    // uXRP - Verified on BaseScan: 60,083 holders
    '0x2615a94df961278dcbc41fb0a54fec5f10a693ae': {
      nativeKey: 'xrp',
      bridgeId: 'universal',
      symbol: 'uXRP',
    },
    '0x7be0cc2cadcd4a8f9901b4a66244dcdd9bd02e0f': {
      nativeKey: 'bch',
      bridgeId: 'universal',
      symbol: 'uBCH',
    },
    '0x5ed25e305e08f58afd7995eac72563e6be65a617': {
      nativeKey: 'near',
      bridgeId: 'universal',
      symbol: 'uNEAR',
    },
    '0x0f813f4785b2360009f9ac9bf6121a85f109efc6': {
      nativeKey: 'dot',
      bridgeId: 'universal',
      symbol: 'uDOT',
    },
    '0x378c326a472915d38b2d8d41e1345987835fab64': {
      nativeKey: 'xlm', // Fixed: This is uXLM, not uTRX
      bridgeId: 'universal',
      symbol: 'uXLM',
    },
    '0xb0505e5a99abd03d94a1169e638b78edfed26ea4': {
      nativeKey: 'sui', // Fixed: This is uSUI, not uBCH
      bridgeId: 'universal',
      symbol: 'uSUI',
    },
    '0xa3a34a0d9a08ccddb6ed422ac0a28a06731335aa': {
      nativeKey: 'ada', // Fixed: This is uADA, not uLTC
      bridgeId: 'universal',
      symbol: 'uADA',
    },
    '0xc79e06860aa9564f95e08fb7e5b61458d0c63898': {
      nativeKey: 'hbar',
      bridgeId: 'universal',
      symbol: 'uHBAR',
    },
    '0x90131d95a9a5b48b6a3ee0400807248becf4b7a4': {
      nativeKey: 'avax',
      bridgeId: 'universal',
      symbol: 'uAVAX',
    },
    '0x40318ee213227894b5316e5ec84f6a5caf3bbedd': {
      nativeKey: 'sui',
      bridgeId: 'universal',
      symbol: 'uSUI',
    },
    '0x9c0e042d65a2e1ff31ac83f404e5cb79f452c337': {
      nativeKey: 'apt',
      bridgeId: 'universal',
      symbol: 'uAPT',
    },
    '0x12e96c2bfea6e835cf8dd38a5834fa61cf723736': {
      nativeKey: 'doge',
      bridgeId: 'universal',
      symbol: 'uDOGE',
    },
    '0xdf5913632251585a55970134fad8a774628e9388': {
      nativeKey: 'ton',
      bridgeId: 'universal',
      symbol: 'uTON',
    },
    '0xd01cb4171a985571deff48c9dc2f6e153a244d64': {
      nativeKey: 'arb',
      bridgeId: 'universal',
      symbol: 'uARB',
    },
    '0xe868c3d83ec287c01bcb533a33d197d9bfa79dad': {
      nativeKey: 'cro',
      bridgeId: 'universal',
      symbol: 'uCRO',
    },
    '0x239b9c1f24f3423062b0d364796e07ee905e9fce': {
      nativeKey: 'link',
      bridgeId: 'universal',
      symbol: 'uLINK',
    },
    '0xe5c436b0a34df18f1dae98af344ca5122e7d57c4': {
      nativeKey: 'uni',
      bridgeId: 'universal',
      symbol: 'uUNI',
    },
    '0xf653e8b6fcbd2a63246c6b7722d1e9d819611241': {
      nativeKey: 'hype',
      bridgeId: 'universal',
      symbol: 'uHYPE',
    },
    '0xacbf16f82753f3d52a2c87e4eeda220c9a7a3762': {
      nativeKey: 'matic',
      bridgeId: 'universal',
      symbol: 'uMATIC',
    },
    '0x3eb097375fc2fc361e4a472f5e7067238c547c52': {
      nativeKey: 'ltc',
      bridgeId: 'universal',
      symbol: 'uLTC',
    },
    // uSOL - Verified on BaseScan: 36,801 holders
    '0x9b8df6e244526ab5f6e6400d331db28c8fdddb55': {
      nativeKey: 'sol',
      bridgeId: 'universal',
      symbol: 'uSOL',
    },
    '0xd403d1624daef243fbcbd4a80d8a6f36affe32b2': {
      nativeKey: 'link',
      bridgeId: 'universal',
      symbol: 'uLINK',
    },
    '0xd61bcf79b26787ae993f75b064d2e3b3cc738c5d': {
      nativeKey: 'algo',
      bridgeId: 'universal',
      symbol: 'uALGO',
    },
    '0x8ccf84de79df699a373421c769f1900aa71200b0': {
      nativeKey: 'fil',
      bridgeId: 'universal',
      symbol: 'uFIL',
    },
    '0x1b0dcc586323c0e10f8be72ecc104048f25fd625': {
      nativeKey: 'aave',
      bridgeId: 'universal',
      symbol: 'uAAVE',
    },
    '0x901754d839cf91eaa3ff7cb11408750fc94174e4': {
      nativeKey: 'vet',
      bridgeId: 'universal',
      symbol: 'uVET',
    },
    '0x6e934283dae5d5d1831cbe8d557c44c9b83f30ee': {
      nativeKey: 'theta',
      bridgeId: 'universal',
      symbol: 'uTHETA',
    },
    '0xdb18fb11db1b972a54bd89ce04bad61855c07788': {
      nativeKey: 'eos',
      bridgeId: 'universal',
      symbol: 'uEOS',
    },
    '0xed1a31bb946f0b86cf9d34a1c90546ca75b091b0': {
      nativeKey: 'kas',
      bridgeId: 'universal',
      symbol: 'uKAS',
    },
    '0xf56ce53561a9cc084e094952232bbfe1e5fb599e': {
      nativeKey: 'zec',
      bridgeId: 'universal',
      symbol: 'uZEC',
    },
    '0x3d00283af5ab11ee7f6ec51573ab62b6fb6dfd8f': {
      nativeKey: 'xdc',
      bridgeId: 'universal',
      symbol: 'uXDC',
    },
    '0x135ff404ba56e167f58bc664156beaa0a0fd95ac': {
      nativeKey: 'dash',
      bridgeId: 'universal',
      symbol: 'uDASH',
    },
    '0x893adcbdc7fcfa0ebb6d3803f01df1ec199bf7c5': {
      nativeKey: 'qtum',
      bridgeId: 'universal',
      symbol: 'uQTUM',
    },
    '0x0935b271ca903ada3ffe1ac1353fc4a49e7ee87b': {
      nativeKey: 'nano',
      bridgeId: 'universal',
      symbol: 'uXNO',
    },
    '0xfa15f1b48447d34b107c8a26cc065e1e872b1a9d': {
      nativeKey: 'btg',
      bridgeId: 'universal',
      symbol: 'uBTG',
    },
    '0x8f2bd24a6406142cbae4b39e14be8efc8157d951': {
      nativeKey: 'etc',
      bridgeId: 'universal',
      symbol: 'uETC',
    },
    '0x1b94330eec66ba458a51b0b14f411910d5f678d0': {
      nativeKey: 'xmr',
      bridgeId: 'universal',
      symbol: 'uXMR',
    },
    '0x17f8d5aa7779094c32536fecb177f93b33b3c3e2': {
      nativeKey: 'mnt',
      bridgeId: 'universal',
      symbol: 'uMNT',
    },
    '0xfdf116c8bef1d4060e4117092298abff80b170ca': {
      nativeKey: 'pepe',
      bridgeId: 'universal',
      symbol: 'uPEPE',
    },

    // Remaining Universal Protocol assets - placeholders may need specific tokens
    '0x16275fd42439a6671b188bdc3949a5ec61932c48': {
      nativeKey: 'btc', // Could be another variant
      bridgeId: 'universal',
    },
    '0x05f191a4aac4b358ab99db3a83a8f96216ecb274': {
      nativeKey: 'eth', // Could be another variant
      bridgeId: 'universal',
    },
    '0x5a03841c2e2f5811f9e548cf98e88e878e55d99e': {
      nativeKey: 'bnb',
      bridgeId: 'universal',
    },
    '0x0340ff1765f0099b3bd1c4664ce03d8fd794fad1': {
      nativeKey: 'sol', // Could be another variant
      bridgeId: 'universal',
    },
    '0xd045be6ab98d17a161cfcfc118a8b428d70543ff': {
      nativeKey: 'ada', // Another uADA variant
      bridgeId: 'universal',
    },
    '0x508e751fdcf144910074cc817a16757f608db52a': {
      nativeKey: 'doge', // Another uDOGE variant
      bridgeId: 'universal',
    },
    '0xc5cdeb649ed1a7895b935acc8eb5aa0d7a8492be': {
      nativeKey: 'xrp', // Another uXRP variant
      bridgeId: 'universal',
    },
    '0x9af46f95a0a8be5c2e0a0274a8b153c72d617e85': {
      nativeKey: 'trx', // uTRX variant
      bridgeId: 'universal',
    },
    '0x3c07ef1bd575b5f5b1ffcb868353f5bc501ed482': {
      nativeKey: 'link', // uLINK variant
      bridgeId: 'universal',
    },
    '0x444fa322da64a49a32d29ccd3a1f4df3de25cf52': {
      nativeKey: 'ltc', // uLTC variant
      bridgeId: 'universal',
    },
    '0x3ecb91ac996e8c55fe1835969a4967f95a07ca71': {
      nativeKey: 'bch', // uBCH variant
      bridgeId: 'universal',
    },
    '0xe3ae3ee16a89973d67b678aad2c3be865dcc6880': {
      nativeKey: 'xlm', // Another uXLM variant
      bridgeId: 'universal',
    },
    '0x544f87a5aa41fcd725ef7c78a37cd9c1c4ba1650': {
      nativeKey: 'avax', // uAVAX variant
      bridgeId: 'universal',
    },
    '0x83f31af747189c2fa9e5deb253200c505eff6ed2': {
      nativeKey: 'sui', // Another uSUI variant
      bridgeId: 'universal',
    },
    '0xcb474f3dee195a951f3584b213d16d2d4d4ee503': {
      nativeKey: 'ton', // uTON variant
      bridgeId: 'universal',
    },
    '0xfb3cb973b2a9e2e09746393c59e7fb0d5189d290': {
      nativeKey: 'shib', // Could be another variant
      bridgeId: 'universal',
    },
    '0xfdca15bd55f350a36e63c47661914d80411d2c22': {
      nativeKey: 'cro', // Could be another variant
      bridgeId: 'universal',
    },
    '0x3a51f2a377ea8b55faf3c671138a00503b031af3': {
      nativeKey: 'dot', // Could be another variant
      bridgeId: 'universal',
    },
    '0xa260ba5fd9ff3fae55ac4930165a9c33519de694': {
      nativeKey: 'uni', // Could be another variant
      bridgeId: 'universal',
    },
    '0x30f16e3273ab6e4584b79b76fd944e577e49a5c8': {
      nativeKey: 'hype', // Could be another variant
      bridgeId: 'universal',
    },
    '0xd76d45358b79564817aa87f02f3b85338b96f06a': {
      nativeKey: 'matic', // Could be another variant
      bridgeId: 'universal',
    },
    '0x2198b777d5cb8cd5aa01d5c4d70f8f28fed9bc05': {
      nativeKey: 'atom', // Could be another variant
      bridgeId: 'universal',
    },
    '0xf081701af06a8d4ecf159c9c178b5ca6a78b5548': {
      nativeKey: 'near', // Could be another variant
      bridgeId: 'universal',
    },
    '0x4b92ea5a2602fba275150db4201a6047056f6913': {
      nativeKey: 'algo', // Could be another variant
      bridgeId: 'universal',
    },
    '0xf383074c4b993d1ccd196188d27d0ddf22ad463c': {
      nativeKey: 'fil', // Could be another variant
      bridgeId: 'universal',
    },
    '0x71a67215a2025f501f386a49858a9ced2fc0249d': {
      nativeKey: 'aave', // Could be another variant
      bridgeId: 'universal',
    },
    '0x31d664ebd97a50d5a2cd49b16f7714ab2516ed25': {
      nativeKey: 'xmr', // Could be another variant
      bridgeId: 'universal',
    },
  },
  // BSC (Binance Smart Chain) - Binance-Peg tokens
  // Verified on BscScan: September 2025
  [ChainId.BSC]: {
    // CMC20 tokens on BSC
    '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c': {
      nativeKey: 'btc',
      bridgeId: 'bsc_bridge',
      symbol: 'BTC',
    },
    '0x2170ed0880ac9a755fd29b2688956bd959f933f8': {
      nativeKey: 'eth',
      bridgeId: 'bsc_bridge',
      symbol: 'ETH',
    },
    '0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe': {
      nativeKey: 'xrp',
      bridgeId: 'bsc_bridge',
      symbol: 'XRP',
    },
    '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c': {
      nativeKey: 'bnb',
      bridgeId: 'native_wrap',
      symbol: 'WBNB',
      wrappedVersion: true,
    },
    '0x570a5d26f7765ecb712c0924e4de545b89fd43df': {
      nativeKey: 'sol',
      bridgeId: 'bsc_bridge',
      symbol: 'SOL',
    },
    '0xba2ae424d960c26247dd6c32edc70b295c744c43': {
      nativeKey: 'doge',
      bridgeId: 'bsc_bridge',
      symbol: 'DOGE',
    },
    '0xce7de646e7208a4ef112cb6ed5038fa6cc6b12e3': {
      nativeKey: 'trx',
      bridgeId: 'bsc_bridge',
      symbol: 'TRX',
    },
    '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47': {
      nativeKey: 'ada',
      bridgeId: 'bsc_bridge',
      symbol: 'ADA',
    },
    '0xaed86a53a8f3dbba4fb6ae7a5f65f337c606bf28': {
      nativeKey: 'hype',
      bridgeId: 'bsc_bridge',
      symbol: 'HYPE',
    },
    '0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd': {
      nativeKey: 'link',
      bridgeId: 'bsc_bridge',
      symbol: 'LINK',
    },
    '0x1ce0c2827e2ef14d5c4f29a091d735a204794041': {
      nativeKey: 'avax',
      bridgeId: 'bsc_bridge',
      symbol: 'AVAX',
    },
    '0xd57f2e190c11cffc667aa5ad026cd4c8de0772a7': {
      nativeKey: 'sui',
      bridgeId: 'bsc_bridge',
      symbol: 'SUI',
    },
    '0x43c934a845205f0b514417d757d7235b8f53f1b9': {
      nativeKey: 'xlm',
      bridgeId: 'bsc_bridge',
      symbol: 'XLM',
    },
    '0x8ff795a6f4d97e7887c79bea79aba5cc76444adf': {
      nativeKey: 'bch',
      bridgeId: 'bsc_bridge',
      symbol: 'BCH',
    },
    '0x0422f966bf8e978075a97d47ef4c7efd3563fa51': {
      nativeKey: 'hbar',
      bridgeId: 'bsc_bridge',
      symbol: 'HBAR',
    },
    '0x4338665cbb7b2485a8855a139b75d5e34ab0db94': {
      nativeKey: 'ltc',
      bridgeId: 'bsc_bridge',
      symbol: 'LTC',
    },
    '0x76a797a59ba2c17726896976b7b3747bfd1d220f': {
      nativeKey: 'ton',
      bridgeId: 'bsc_bridge',
      symbol: 'TON',
    },
    '0x2859e4544c4bb03966803b044a93563bd2d0dd4d': {
      nativeKey: 'shib',
      bridgeId: 'bsc_bridge',
      symbol: 'SHIB',
    },
    '0x757d4455e500cdd50c042b5b4af79c89e0a85396': {
      nativeKey: 'cro',
      bridgeId: 'bsc_bridge',
      symbol: 'CRO',
    },
    '0x7083609fce4d1d8dc0c979aab8c869ea2c873402': {
      nativeKey: 'dot',
      bridgeId: 'bsc_bridge',
      symbol: 'DOT',
    },
    '0xbf5140a22578168fd562dccf235e5d43a02ce9b1': {
      nativeKey: 'uni',
      bridgeId: 'bsc_bridge',
      symbol: 'UNI',
    },
  },
  [ChainId.Mainnet]: {
    // Add mainnet wrapped versions
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': {
      nativeKey: 'btc',
      bridgeId: 'native_wrap',
      symbol: 'WBTC',
      wrappedVersion: true,
    },
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
      nativeKey: 'eth',
      bridgeId: 'native_wrap',
      symbol: 'WETH',
      wrappedVersion: true,
    },
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
