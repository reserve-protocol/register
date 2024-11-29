import Concentrator from 'components/icons/Concentrator'
import Aerodrome from 'components/icons/logos/Aerodrome'
import Balancer from 'components/icons/logos/Balancer'
import Convex from 'components/icons/logos/Convex'
import Curve from 'components/icons/logos/Curve'
import Dinero from 'components/icons/logos/Dinero'
import Dyson from 'components/icons/logos/Dyson'
import Ethena from 'components/icons/logos/Ethena'
import Extra from 'components/icons/logos/Extra'
import Merkl from 'components/icons/logos/Merkl'
import Morpho from 'components/icons/logos/Morpho'
import Stader from 'components/icons/logos/Stader'
import Stakedao from 'components/icons/logos/Stakedao'
import Uniswap from 'components/icons/logos/Uniswap'
import Yearn from 'components/icons/logos/Yearn'
import Beefy from 'components/icons/Beefy'
import Camelot from 'components/icons/Camelot'
import { Token } from 'types'
import { ChainId } from 'utils/chains'
// @ts-ignore
import mainnetPools from 'utils/pools/data/mainnet.json'
// @ts-ignore
import basePools from 'utils/pools/data/base.json'
// @ts-ignore
import arbitrumPools from 'utils/pools/data/arbitrum.json'

export type ZapPool = {
  out: Token
  rToken: Token
}

export const ZAP_EARN_POOLS: Record<number, Record<string, ZapPool>> = {
  [ChainId.Mainnet]: mainnetPools,
  [ChainId.Base]: basePools,
  [ChainId.Arbitrum]: arbitrumPools,
}

export const ZAP_EARN_POOLS_IDS: string[] = Object.values(
  ZAP_EARN_POOLS
).flatMap((pools) => Object.keys(pools))

export const PROJECT_ICONS: Record<string, React.ReactElement> = {
  'yearn-finance': <Yearn fontSize={16} />,
  'convex-finance': <Convex fontSize={16} />,
  'curve-dex': <Curve />,
  'aerodrome-v1': <Aerodrome />,
  'aerodrome-slipstream': <Aerodrome />,
  stakedao: <Stakedao fontSize={16} />,
  'uniswap-v3': <Uniswap fontSize={16} />,
  'balancer-v2': <Balancer fontSize={16} />,
  'extra-finance': <Extra fontSize={16} />,
  'camelot-v3': <Camelot />,
  beefy: <Beefy />,
  concentrator: <Concentrator />,
  dyson: <Dyson />,
  'morpho-blue': <Morpho />,
  merkl: <Merkl />,
  ethena: <Ethena />,
  'dinero-(pirex-eth)': <Dinero />,
  stader: <Stader />,
}

export const OTHER_POOL_TOKENS: Record<
  string,
  { address: string; symbol: string; logo: string }
> = {
  '0x3175df0976dfa876431c2e9ee6bc45b65d3473cc': {
    address: '0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC',
    symbol: 'FRAXBP',
    logo: '',
  },
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    symbol: 'USDC',
    address: '0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC',
    logo: '',
  },
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
    symbol: 'WETH',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    logo: '',
  },
  '0x853d955acef822db058eb8505911ed77f175b99e': {
    symbol: 'FRAX',
    address: '0x853d955acef822db058eb8505911ed77f175b99e',
    logo: '',
  },
  // Base
  '0x417ac0e078398c154edfadd9ef675d30be60af93': {
    symbol: 'crvUSD',
    address: '0x417Ac0e078398C154EdFadD9Ef675d30Be60Af93',
    logo: '',
  },
  '0x4200000000000000000000000000000000000006': {
    symbol: 'WETH',
    address: '0x4200000000000000000000000000000000000006',
    logo: '',
  },
  '0xb79dd08ea68a908a97220c76d19a6aa9cbde4376': {
    symbol: 'USD+',
    address: '0xb79dd08ea68a908a97220c76d19a6aa9cbde4376',
    logo: '',
  },
  '0xbf1aea8670d2528e08334083616dd9c5f3b087ae': {
    symbol: 'MAI',
    address: '0xbf1aea8670d2528e08334083616dd9c5f3b087ae',
    logo: '',
  },
  '0x4621b7a9c75199271f773ebd9a499dbd165c3191': {
    symbol: 'DOLA',
    address: '0x4621b7a9c75199271f773ebd9a499dbd165c3191',
    logo: '',
  },
  // Mainnet
  '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e': {
    symbol: 'crvUSD',
    address: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
    logo: '',
  },
  '0x4591dbff62656e7859afe5e45f6f47d3669fbb28': {
    symbol: 'mkUSD',
    address: '0x4591DBfF62656E7859Afe5e45f6f47D3669fBB28',
    logo: '',
  },
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': {
    symbol: 'USDC',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    logo: '',
  },
  '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca': {
    symbol: 'USDBC',
    address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    logo: '',
  },
  '0x865377367054516e17014ccded1e7d814edc9ce4': {
    symbol: 'DOLA',
    address: '0x865377367054516e17014ccded1e7d814edc9ce4',
    logo: '',
  },
  '0x0000000000000000000000000000000000000000': {
    symbol: 'ETH',
    address: '0x0000000000000000000000000000000000000000',
    logo: '',
  },
  '0x04c154b66cb340f3ae24111cc767e0184ed00cc6': {
    symbol: 'pxETH',
    address: '0x04c154b66cb340f3ae24111cc767e0184ed00cc6',
    logo: '',
  },
  '0x085780639cc2cacd35e474e71f4d000e2405d8f6': {
    symbol: 'FXUSD',
    address: '0x085780639cc2cacd35e474e71f4d000e2405d8f6',
    logo: '',
  },
  '0xbc6da0fe9ad5f3b0d58160288917aa56653660e9': {
    symbol: 'ALUSD',
    address: '0xbc6da0fe9ad5f3b0d58160288917aa56653660e9',
    logo: '',
  },
  '0x73968b9a57c6e53d41345fd57a6e6ae27d6cdb2f': {
    symbol: 'SDT',
    address: '0x73968b9a57c6e53d41345fd57a6e6ae27d6cdb2f',
    logo: '',
  },
  // Arbitrum
  '0x82af49447d8a07e3bd95bd0d56f35241523fbab1': {
    symbol: 'WETH',
    address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    logo: '',
  },
  '0x498bf2b1e120fed3ad3d42ea2165e9b73f99c1e5': {
    symbol: 'crvUSD',
    address: '0x498bf2b1e120fed3ad3d42ea2165e9b73f99c1e5',
    logo: '',
  },
  '0xca5ca9083702c56b481d1eec86f1776fdbd2e594': {
    symbol: 'RSR',
    address: '0xca5ca9083702c56b481d1eec86f1776fdbd2e594',
    logo: '',
  },
  '0xaf88d065e77c8cc2239327c5edb3a432268e5831': {
    symbol: 'USDC',
    address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
    logo: '',
  },
}

export const EXTRA_POOLS_BY_UNDERLYING_TOKEN = [
  '0x5bfb340fa9305abb164fb0248d0d82fc3d82c3bb',
  '0xb5e331615fdba7df49e05cdeaceb14acdd5091c3',
]
