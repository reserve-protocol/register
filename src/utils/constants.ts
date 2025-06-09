import { Token, Trader } from 'types'
import {
  ETHPLUS_ADDRESS,
  EUSD_ADDRESS,
  RGUSD_ADDRESS,
  RSR_ADDRESS,
  USD3_ADDRESS,
} from './addresses'
import { ChainId } from './chains'
import rtokens from '@reserve-protocol/rtokens'
import RSV from './rsv'
import { Address } from 'viem'

const isStaging =
  window.location.hostname.includes('staging') &&
  import.meta.env.VITE_STAGING_API

export const RESERVE_API = isStaging
  ? import.meta.env.VITE_STAGING_API
  : // : 'https://api.reserve.org/'
    'http://localhost:3000/'
export const VERSION = '3.0.0'
export const DISCORD_INVITE = 'https://discord.gg/reserveprotocol'
export const PROTOCOL_DOCS = 'https://reserve.org/protocol/'
export const INDEX_PROTOCOL_DOCS = 'https://reserve.org/protocol/index_dtfs/'
export const REGISTER_FEEDBACK = 'https://reserve.canny.io/register-app'
export const RESERVE_BLOG = 'https://blog.reserve.org/'
export const RESERVE_FORUM = 'https://forum.reserve.org/'
export const REGISTER_BUGS =
  'https://reserve.canny.io/defi-surfaces-bug-reporting'
export const RESERVE_STORAGE = 'https://storage.reserve.org/'
export const DUNE_DASHBOARD =
  'https://dune.com/reserve-protocol/reserve-protocol-overview'
export const REPOSITORY_URL = 'https://github.com/reserve-protocol/register'
export const RESERVE_X = 'https://x.com/reserveprotocol'
export const DTF_VIDEO =
  'https://www.youtube.com/watch?v=EL9OHjIab_w&ab_channel=Reserve'

export const LP_PROJECTS: { [x: string]: { name: string; site: string } } = {
  'curve-dex': {
    name: 'Curve',
    site: 'https://curve.fi/#/ethereum/pools',
  },
  'convex-finance': {
    name: 'Convex',
    site: 'https://www.convexfinance.com/stake',
  },
  'yearn-finance': {
    name: 'Yearn',
    site: 'https://yearn.fi/vaults',
  },
  stakedao: {
    name: 'StakeDAO',
    site: 'https://www.stakedao.org/yield',
  },
  'uniswap-v3': {
    name: 'Uniswap',
    site: 'https://app.uniswap.org/',
  },
  'balancer-v2': {
    name: 'Balancer',
    site: 'https://app.balancer.fi/',
  },
  'extra-finance': {
    name: 'Extra Finance',
    site: 'https://app.extrafi.io/lend',
  },
  'aerodrome-v1': {
    name: 'Aerodrome',
    site: 'https://aerodrome.finance/',
  },
  'aerodrome-slipstream': {
    name: 'Aerodrome Slipstream',
    site: 'https://aerodrome.finance/',
  },
  beefy: {
    name: 'Beefy',
    site: 'https://app.beefy.finance/',
  },
  concentrator: {
    name: 'Concentrator',
    site: 'https://concentrator.aladdin.club/',
  },
  dyson: {
    name: 'Dyson',
    site: 'https://app.dyson.money/',
  },
  'camelot-v3': {
    name: 'Camelot',
    site: 'https://app.camelot.exchange/',
  },
  'morpho-blue': {
    name: 'Morpho',
    site: 'https://app.morpho.org/',
  },
  merkl: {
    name: 'Merkl',
    site: 'https://merkl.angle.money/',
  },
  ethena: {
    name: 'Ethena',
    site: 'https://ethena.fi/',
  },
  'dinero-(pirex-eth)': {
    name: 'Dinero',
    site: 'https://dinero.xyz/',
  },
  stader: {
    name: 'Stader',
    site: 'https://www.staderlabs.com/',
  },
  'sky-lending': {
    name: 'Sky',
    site: 'https://sky.money/',
  },
  'origin-ether': {
    name: 'Origin',
    site: 'https://www.originprotocol.com/',
  },
}

// List of supported networks with label
export const NETWORKS: Record<string, number> = {
  ethereum: ChainId.Mainnet,
  base: ChainId.Base,
  arbitrum: ChainId.Arbitrum,
}

export const CHAIN_TO_NETWORK = Object.entries(NETWORKS).reduce(
  (acc, [network, chainId]) => {
    acc[chainId] = network
    return acc
  },
  {} as Record<number, string>
)

export const BIGINT_MAX =
  115792089237316195423570985008687907853269984665640564039457584007913129639935n

export const COLLATERAL_STATUS = {
  SOUND: 0,
  IFFY: 1,
  DEFAULT: 2,
}

// Governance proposal states
export const PROPOSAL_STATES = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  CANCELED: 'CANCELED',
  DEFEATED: 'DEFEATED',
  QUORUM_NOT_REACHED: 'QUORUM_NOT_REACHED',
  SUCCEEDED: 'SUCCEEDED',
  QUEUED: 'QUEUED',
  EXPIRED: 'EXPIRED',
  EXECUTED: 'EXECUTED',
}

// Supported collateral plugins target unit
export const TARGET_UNITS = {
  USD: 'USD',
  EUR: 'EUR',
  ETH: 'ETH',
  BTC: 'BTC',
  TRICRYPTO: 'TRICRYPTOLP',
}

export const TIME_RANGES = {
  DAY: '24h',
  WEEK: '7d',
  MONTH: '30d',
  YEAR: '1y',
}

export const TIME_RANGE_VALUE: { [x: string]: number } = {
  [TIME_RANGES.DAY]: 86400,
  [TIME_RANGES.WEEK]: 604800,
  [TIME_RANGES.MONTH]: 2592000,
  [TIME_RANGES.YEAR]: 31104000,
}

export const GOVERNANCE_PROPOSAL_TYPES = {
  BASKET: 'basket',
  FEES: 'fees',
  ROLES: 'roles',
  OTHER: 'other',
  WHITELIST: 'whitelist',
}

export const ROUTES = Object.freeze({
  OVERVIEW: 'overview',
  STAKING: 'staking',
  ISSUANCE: 'issuance',
  AUCTIONS: 'auctions',
  MANAGE: 'manage',
  DEPLOY: '/deploy',
  DEPLOY_YIELD: '/deploy/yield-dtf',
  DEPLOY_INDEX: '/deploy/index-dtf',
  SETTINGS: 'settings',
  GOVERNANCE_SETUP: 'governance/setup',
  GOVERNANCE_INFO: 'governance-info',
  LIST: 'list',
  HOME: '/',
  COMPARE: '/compare',
  WALLET: '/wallet',
  TOKENS: '/tokens',
  GOVERNANCE: 'governance',
  GOVERNANCE_PROPOSE: 'propose',
  GOVERNANCE_PROPOSAL: 'governance/proposal',
  ZAP: '/zap',
  BRIDGE: '/bridge',
  PORTFOLIO: '/portfolio',
  EARN: '/earn',
  NOT_FOUND: '/404',
  EXPLORER: '/explorer',
  EXPLORER_TOKENS: '/explorer/tokens',
  EXPLORER_COLLATERALS: 'collaterals',
  EXPLORER_GOVERNANCE: '/explorer/governance',
  EXPLORER_REVENUE: '/explorer/revenue',
  EXPLORER_TRANSACTIONS: 'transactions',
  DISCOVER: '/discover',
})

export const RSR: Token = {
  address: RSR_ADDRESS[ChainId.Mainnet],
  name: 'Reserve Rights',
  symbol: 'RSR',
  decimals: 18,
}

export const PROTOCOL_SLUG = 'reserveprotocol-v1'

export const capitalize = (str: string) =>
  str.slice(0, 1).toUpperCase() + str.slice(1)

export const formatConstant = (str: string) =>
  capitalize(str.toLowerCase().replaceAll('_', ' '))

export const blockDuration = {
  [ChainId.Mainnet]: 12,
  [ChainId.Base]: 2,
  [ChainId.Arbitrum]: 1,
}
export const supportedChainList = [
  ChainId.Mainnet,
  ChainId.Base,
  ChainId.Arbitrum,
]

export const FIXED_PLATFORM_FEE = 50
// Load environment variables.
export const TENDERLY_ACCESS_TOKEN: string = import.meta.env
  .VITE_TENDERLY_ACCESS_TOKEN!
export const TENDERLY_USER: string = import.meta.env.VITE_TENDERLY_USER!
export const TENDERLY_PROJECT_SLUG: string = import.meta.env
  .VITE_TENDERLY_PROJECT_SLUG!

// Tenderly simulation
export const BLOCK_GAS_LIMIT = 30_000_000
export const DEFAULT_FROM = '0xD73a92Be73EfbFcF3854433A5FcbAbF9c1316073' // arbitrary EOA not used on-chain
export const TENDERLY_BASE_URL = `https://api.tenderly.co/api/v1`
export const TENDERLY_ENCODE_URL = `${TENDERLY_BASE_URL}/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT_SLUG}/contracts/encode-states`
export const TENDERLY_SIM_URL = `${TENDERLY_BASE_URL}/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT_SLUG}/simulate`
export const TENDERLY_SHARE_URL = (id: string) =>
  `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT_SLUG}/simulations/${id}/share`
export const TENDERLY_SHARING_URL = (id: string) =>
  `https://dashboard.tenderly.co/shared/simulation/${id}`

export const CHAIN_TAGS = {
  [ChainId.Mainnet]: 'Ethereum',
  [ChainId.Base]: 'Base',
  [ChainId.Arbitrum]: 'Arbitrum One',
  [ChainId.BSC]: 'BNB Smart Chain',
}

export const LISTED_RTOKEN_ADDRESSES: { [x: number]: string[] } = {
  [ChainId.Mainnet]: [RSV.address.toLowerCase()],
}

export const BRIDGED_RTOKENS = {
  [ChainId.Mainnet]: {
    [EUSD_ADDRESS[ChainId.Mainnet]]: [
      {
        address: EUSD_ADDRESS[ChainId.Base],
        chain: ChainId.Base,
      },
      {
        address: EUSD_ADDRESS[ChainId.Arbitrum],
        chain: ChainId.Arbitrum,
      },
    ],
    [ETHPLUS_ADDRESS[ChainId.Mainnet]]: [
      {
        address: ETHPLUS_ADDRESS[ChainId.Arbitrum],
        chain: ChainId.Arbitrum,
      },
    ],
    [RGUSD_ADDRESS[ChainId.Mainnet]]: [
      {
        address: RGUSD_ADDRESS[ChainId.Base],
        chain: ChainId.Base,
      },
      {
        address: RGUSD_ADDRESS[ChainId.Arbitrum],
        chain: ChainId.Arbitrum,
      },
    ],
    [USD3_ADDRESS[ChainId.Mainnet]]: [
      {
        address: USD3_ADDRESS[ChainId.Base],
        chain: ChainId.Base,
      },
    ],
  },
}

export const BRIDGE_RTOKEN_MAP = Object.entries(
  BRIDGED_RTOKENS[ChainId.Mainnet]
).reduce(
  (acc, [key, tokens]) => {
    for (const token of tokens) {
      acc[token.address] = key
    }

    return acc
  },
  {} as Record<string, string>
)

for (const chain of supportedChainList) {
  LISTED_RTOKEN_ADDRESSES[chain] = [
    ...Object.keys(rtokens[chain] || {}).map((s) => s.toLowerCase()),
  ]
}

export const TRADERS: Trader[] = ['backingManager', 'rsrTrader', 'rTokenTrader']

export const TraderLabels: Record<Trader, string> = {
  backingManager: 'Backing Manager',
  rsrTrader: 'RSR Trader',
  rTokenTrader: 'RToken Trader',
}

export const collateralDisplay: Record<string, string> = {
  sadai: 'AAVE DAI',
  sausdc: 'AAVE USDC',
  sausdt: 'AAVE USDT',
  sabusd: 'AAVE BUSD',
  sausdp: 'AAVE USDP',
  cdai: 'Compound DAI',
  cusdc: 'Compound USDC',
  cusdt: 'Compound USDT',
  cusdp: 'Compound USDP',
  cwbtc: 'Compound WBTC',
  ceth: 'Compound ETH',
  reth: 'Rocket Pool ETH',
  weth: 'Wrapped ETH',
  wsteth: 'Wrapped Staked ETH',
  fusdc: 'Flux USDC',
  fusdt: 'Flux USDT',
  fdai: 'Flux DAI',
  ffrax: 'Flux FRAX',
  wcusdcv3: 'Compound USDC V3',
  wcusdtv3: 'Compound USDT V3',
  wcusdbcv3: 'Compound USDbC V3',
  stkcvx3crv: 'Convex DAI/USDC/USDT',
  'stkcvxeusd3crv-f': 'Convex eUSD/FRAXBP',
  'stkcvxmim-3lp3crv-f': 'Convex MIM/3CRV',
  ws3crv: 'Curve DAI/USDC/USDT',
  weusdfraxbp: 'Curve eUSD/FRAXBP',
  wmim3crv: 'Curve MIM/3CRV',
  sdai: 'Savings DAI',
  cbeth: 'Coinbase ETH',
  meusd: 'Morpho eUSD',
  'mrp-ausdt': 'Morpho AAVE USDT',
  'mrp-ausdc': 'Morpho AAVE USDC',
  'mrp-adai': 'Morpho AAVE DAI',
  'mrp-awbtc': 'Morpho AAVE WBTC',
  'mrp-aweth': 'Morpho AAVE WETH',
  'mrp-asteth': 'Morpho AAVE Staked ETH',
  sabasusdbc: 'AAVE Base USDbC',
  wsgusdbc: 'Stargate Base USDbC',
  saethusdc: 'AAVE USDC V3',
  saethusdt: 'AAVE USDT V3',
  stkcvxpyusdusdc: 'Convex PYUSD/USDC',
  saethpyusd: 'AAVE PYUSD V3',
  sabasusdc: 'AAVE USDC V3',
  sfrxeth: 'Staked Frax ETH',
  re7weth: 'Morpho Re7 WETH Vault',
  'stkcvxcrvusdusdt-f': 'Convex crvUSD/USDT',
  'stkcvxcrvusdusdc-f': 'Convex crvUSD/USDC',
  steakpyusd: 'Morpho pyUSD',
  bbusdt: 'Morpho USDT',
  steakusdc: 'Morpho Steakhouse USDC',
  saarbusdcn: 'AAVE USDC V3',
  saarbusdt: 'AAVE USDT V3',
  'stkcvxeth+eth-f': 'Convex ETH+/ETH',
  apxeth: 'Autocompounding Pirex ETH',
  susde: 'Ethena Staked USDe',
  susds: 'Sky Savings USDS',
  ethx: 'Stader ETHx',
  pyusd: 'PayPal USD',
  woeth: 'Origin Wrapped OETH',
  'wsamm-eusd/usdc': 'Aerodrome eUSD/USDC LP',
  'wvamm-weth/degen': 'Aerodrome WETH/DEGEN LP',
  'wvamm-weth/well': 'Aerodrome WETH/WELL LP',
  'wvamm-weth/cbbtc': 'Aerodrome WETH/cbBTC LP',
  'wvamm-mog/weth': 'Aerodrome Mog/WETH LP',
  'wvamm-weth/aero': 'Aerodrome WETH/AERO LP',
  'wsamm-usdz/usdc': 'Aerodrome USDz/USDC LP',
}

export const RTOKEN_VAULT_STAKE: Record<
  Address,
  { name: string; address: Address }
> = {
  // dgnETH: sdgnETH
  '0x005F893EcD7bF9667195642f7649DA8163e23658': {
    name: 'sdgnETH',
    address: '0x5BDd1fA233843Bfc034891BE8a6769e58F1e1346',
  },
}

export const UNIVERSAL_ASSETS = new Set([
  '0xf1143f3a8d76f1ca740d29d5671d365f66c44ed1',
  '0xd6a34b430c05ac78c24985f8abee2616bc1788cb',
  '0x0f813f4785b2360009f9ac9bf6121a85f109efc6',
  '0xd403d1624daef243fbcbd4a80d8a6f36affe32b2',
  '0x7be0cc2cadcd4a8f9901b4a66244dcdd9bd02e0f',
  '0x5ed25e305e08f58afd7995eac72563e6be65a617',
  '0x378c326a472915d38b2d8d41e1345987835fab64',
  '0xb0505e5a99abd03d94a1169e638b78edfed26ea4',
  '0xa3a34a0d9a08ccddb6ed422ac0a28a06731335aa',
  '0xc79e06860aa9564f95e08fb7e5b61458d0c63898',
  '0x90131d95a9a5b48b6a3ee0400807248becf4b7a4',
  '0x40318ee213227894b5316e5ec84f6a5caf3bbedd',
  '0x9c0e042d65a2e1ff31ac83f404e5cb79f452c337',
  '0xdf5913632251585a55970134fad8a774628e9388',
  '0xd01cb4171a985571deff48c9dc2f6e153a244d64',
  '0xe868c3d83ec287c01bcb533a33d197d9bfa79dad',
  '0x12e96c2bfea6e835cf8dd38a5834fa61cf723736',
  '0x239b9c1f24f3423062b0d364796e07ee905e9fce',
  '0xe5c436b0a34df18f1dae98af344ca5122e7d57c4',
  '0xf653e8b6fcbd2a63246c6b7722d1e9d819611241',
  '0xacbf16f82753f3d52a2c87e4eeda220c9a7a3762',
  '0x3eb097375fc2fc361e4a472f5e7067238c547c52',
  '0x9b8df6e244526ab5f6e6400d331db28c8fdddb55',
  '0xd61bcf79b26787ae993f75b064d2e3b3cc738c5d',
  '0x8ccf84de79df699a373421c769f1900aa71200b0',
  '0x1b0dcc586323c0e10f8be72ecc104048f25fd625',
  '0x901754d839cf91eaa3ff7cb11408750fc94174e4',
  '0x6e934283dae5d5d1831cbe8d557c44c9b83f30ee',
  '0xdb18fb11db1b972a54bd89ce04bad61855c07788',
  '0xed1a31bb946f0b86cf9d34a1c90546ca75b091b0',
  '0xf56ce53561a9cc084e094952232bbfe1e5fb599e',
  '0x3d00283af5ab11ee7f6ec51573ab62b6fb6dfd8f',
  '0x135ff404ba56e167f58bc664156beaa0a0fd95ac',
  '0x893adcbdc7fcfa0ebb6d3803f01df1ec199bf7c5',
  '0x0935b271ca903ada3ffe1ac1353fc4a49e7ee87b',
  '0xfa15f1b48447d34b107c8a26cc065e1e872b1a9d',
  '0x8f2bd24a6406142cbae4b39e14be8efc8157d951',
  '0x1b94330eec66ba458a51b0b14f411910d5f678d0',
  '0x17f8d5aa7779094c32536fecb177f93b33b3c3e2',
  '0xfdf116c8bef1d4060e4117092298abff80b170ca',
  '0xf413af1169516a3256504977b8ed0248fbd48f23',
  '0xd7d5c59457d66fe800dba22b35e9c6c379d64499',
  '0x8989377fd349adfa99e6ce3cb6c0d148dfc7f19e',
  '0x16275fd42439a6671b188bdc3949a5ec61932c48',
  '0x05f191a4aac4b358ab99db3a83a8f96216ecb274',
  '0x5a03841c2e2f5811f9e548cf98e88e878e55d99e',
  '0x0340ff1765f0099b3bd1c4664ce03d8fd794fad1',
  '0xd045be6ab98d17a161cfcfc118a8b428d70543ff',
  '0x508e751fdcf144910074cc817a16757f608db52a',
  '0xc5cdeb649ed1a7895b935acc8eb5aa0d7a8492be',
  '0x9af46f95a0a8be5c2e0a0274a8b153c72d617e85',
  '0x3c07ef1bd575b5f5b1ffcb868353f5bc501ed482',
  '0x444fa322da64a49a32d29ccd3a1f4df3de25cf52',
  '0x3ecb91ac996e8c55fe1835969a4967f95a07ca71',
  '0xe3ae3ee16a89973d67b678aad2c3be865dcc6880',
  '0x544f87a5aa41fcd725ef7c78a37cd9c1c4ba1650',
  '0x83f31af747189c2fa9e5deb253200c505eff6ed2',
  '0xcb474f3dee195a951f3584b213d16d2d4d4ee503',
  '0x2615a94df961278dcbc41fb0a54fec5f10a693ae',
  '0xfb3cb973b2a9e2e09746393c59e7fb0d5189d290',
  '0xfdca15bd55f350a36e63c47661914d80411d2c22',
  '0x3a51f2a377ea8b55faf3c671138a00503b031af3',
  '0xa260ba5fd9ff3fae55ac4930165a9c33519de694',
  '0x30f16e3273ab6e4584b79b76fd944e577e49a5c8',
  '0xd76d45358b79564817aa87f02f3b85338b96f06a',
  '0x2198b777d5cb8cd5aa01d5c4d70f8f28fed9bc05',
  '0xf081701af06a8d4ecf159c9c178b5ca6a78b5548',
  '0x4b92ea5a2602fba275150db4201a6047056f6913',
  '0xf383074c4b993d1ccd196188d27d0ddf22ad463c',
  '0x71a67215a2025f501f386a49858a9ced2fc0249d',
  '0x31d664ebd97a50d5a2cd49b16f7714ab2516ed25',
])

export const WORMHOLE_ASSETS = new Set([
  '0x7fdaa50d7399ac436943028eda6ed9a1bd89509f',
  '0xfa1df3f6108db461fd89437f320fe50c125af5f0',
  '0x51436f6bd047797de7d11e9d32685f029aed1069',
  '0xcb9eec5748aafa41fbcbe0b58465efed11ce176',
  '0xf0134c5ea11d1fc75fa1b25fac00f8d82c38bd52',
  '0x224a0cb0c937018123b441b489a74eaf689da78f',
  '0xdc1437d7390016af12fe501e4a65ec42d35469ce',
  '0x9a1da46efad9a87f68720b46c2777a9e3a5b4302',
  '0x781f50ea0dad22aee73e94bced1003f4cbd2bb5e',
  '0x417dbf0b8f24a1af0a2a4a76094b578c08f90a3d',
  '0x10f4799f0feeea0e74454e0b6669d3c0cf7b93bf',
  '0xf0134c5ea11d1fc75fa1b25fac00f8d82c38bd52',
  '0x55b3e31739247d010ece7ddc365eae512b16fa7e',
  '0x5b0a82456d018f21881d1d5460e37aefd56d54b3',
  '0xf905b22e30743dc07d8ed7fdf0ef0f5ec76e52be',
  '0x6ad49f3bd3e15a7ee14a3b246824858e97910ed0',
  '0xb0bb1cae834d533d7b75300f4f818ef3ef8a18b8',
  '0xdc1437d7390016af12fe501e4a65ec42d35469ce',
  '0x4c5d8a75f3762c1561d96f177694f67378705e98',
  '0xa76a29923ccfb59e734e907688b659e48a55fd07',
  '0xcb9eec5748aafa41fbcbe0b58465efed11ce176',
  '0x224a0cb0c937018123b441b489a74eaf689da78f',
  '0xcb9eec5748aaafa41fbcbe0b58465efed11ce176',
  '0x3992b27da26848c2b19cea6fd25ad5568b68ab98',
])
