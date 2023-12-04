import rtokens from '@lc-labs/rtokens'
import { EUSD_ADDRESS, RSR_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'
import { Address } from 'viem'

export interface BridgeAsset {
  L1symbol: string
  L2symbol: string
  L1chainId: number
  L2chainId: number
  L1icon: string
  L2icon: string
  L1name: string
  L2name: string
  decimals: number
  protocol: string
  L1contract?: Address
  L2contract?: Address
}

const BRIDGE_ASSETS: BridgeAsset[] = [
    {
    L1symbol: 'ETH',
    L2symbol: 'ETH',
    L1chainId: ChainId.Mainnet,
    L2chainId: ChainId.Base,
    L1icon: '/svgs/eth.svg',
    L2icon: '/svgs/eth.svg',
    decimals: 18,
    L1name: 'Ether',
    L2name: 'Ether',
    protocol: 'OP',
  },
  {
    L1symbol: 'RSR',
    L2symbol: 'RSR',
    L1chainId: ChainId.Mainnet,
    L2chainId: ChainId.Base,
    L1contract: RSR_ADDRESS[ChainId.Mainnet],
    L2contract: RSR_ADDRESS[ChainId.Base],
    L1icon: '/svgs/rsr.svg',
    L2icon: '/svgs/rsr.svg',
    L1name: 'Reserve Rights',
    L2name: 'Reserve Rights',
    decimals: 18,
    protocol: 'OP',
  },
  {
    L1symbol: 'eUSD',
    L2symbol: 'eUSD',
    L1chainId: ChainId.Mainnet,
    L2chainId: ChainId.Base,
    L1contract: EUSD_ADDRESS[ChainId.Mainnet],
    L2contract: EUSD_ADDRESS[ChainId.Base],
    L1icon: `/svgs/${
      rtokens[ChainId.Mainnet][EUSD_ADDRESS[ChainId.Mainnet]].logo
    }`,
    L2icon: `/svgs/${
      rtokens[ChainId.Mainnet][EUSD_ADDRESS[ChainId.Mainnet]].logo
    }`,
    L1name: 'Electronic Dollar',
    L2name: 'Electronic Dollar',
    decimals: 18,
    protocol: 'OP',
  },
  {
    L1symbol: 'STG',
    L2symbol: 'STG',
    L1chainId: ChainId.Mainnet,
    L2chainId: ChainId.Base,
    L1contract: '0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6',
    L2contract: '0xE3B53AF74a4BF62Ae5511055290838050bf764Df',
    L1icon: '/svgs/stg.svg',
    L2icon: '/svgs/stg.svg',
    L1name: 'Stargate Token',
    L2name: 'Stargate Token',
    decimals: 18,
    protocol: 'OP',
  },
  // Common supported by base official bridge
  {
    L1symbol: 'cbETH',
    L2symbol: 'cbETH',
    L1chainId: ChainId.Mainnet,
    L2chainId: ChainId.Base,
    L1contract: '0xbe9895146f7af43049ca1c1ae358b0541ea49704',
    L2contract: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
    L1icon: '/svgs/cbeth.svg',
    L2icon: '/svgs/cbeth.svg',
    L1name: 'Coinbase Wrapped Staked ETH',
    L2name: 'Coinbase Wrapped Staked ETH',
    decimals: 18,
    protocol: 'OP',
  },
  {
    L1symbol: 'DAI',
    L2symbol: 'DAI',
    L1chainId: ChainId.Mainnet,
    L2chainId: ChainId.Base,
    L1contract: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    L2contract: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    L1icon: '/svgs/dai.svg',
    L2icon: '/svgs/dai.svg',
    L1name: 'Dai Stablecoin',
    L2name: 'Dai Stablecoin',
    decimals: 18,
    protocol: 'OP',
  },
  {
    L1symbol: 'USDC',
    L2symbol: 'USDbC',
    L1chainId: ChainId.Mainnet,
    L2chainId: ChainId.Base,
    L1contract: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    L2contract: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    L1icon: '/svgs/usdc.svg',
    L2icon: '/svgs/usdbc.svg',
    L1name: 'USDC',
    L2name: 'USD Base Coin',
    decimals: 6,
    protocol: 'OP',
  },
  {
    L1symbol: 'COMP',
    L2symbol: 'COMP',
    L1chainId: ChainId.Mainnet,
    L2chainId: ChainId.Base,
    L1contract: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
    L2contract: '0x9e1028F5F1D5eDE59748FFceE5532509976840E0',
    L1icon: '/svgs/comp.svg',
    L2icon: '/svgs/comp.svg',
    L1name: 'Compound',
    L2name: 'Compound',
    decimals: 18,
    protocol: 'OP',
  },
  {
    L1symbol: 'BAL',
    L2symbol: 'BAL',
    L1chainId: ChainId.Mainnet,
    L2chainId: ChainId.Base,
    L1contract: '0xba100000625a3754423978a60c9317c58a424e3D',
    L2contract: '0x4158734D47Fc9692176B5085E0F52ee0Da5d47F1',
    L1icon: '/svgs/balancer.svg',
    L2icon: '/svgs/balancer.svg',
    L1name: 'Balancer',
    L2name: 'Balancer',
    decimals: 18,
    protocol: 'OP',
  },
  {
    L1symbol: 'RPL',
    L2symbol: 'RPL',
    L1chainId: ChainId.Mainnet,
    L2chainId: ChainId.Base,
    L1contract: '0xD33526068D116cE69F19A9ee46F0bd304F21A51f',
    L2contract: '0x1f73EAf55d696BFFA9b0EA16fa987B93b0f4d302',
    L1icon: '/svgs/rocket-pool.png',
    L2icon: '/svgs/rocket-pool.png',
    L1name: 'Rocket Pool Protocol',
    L2name: 'Rocket Pool Protocol',
    decimals: 18,
    protocol: 'OP',
  },
  {
    L1symbol: 'rETH',
    L2symbol: 'rETH',
    L1chainId: ChainId.Mainnet,
    L2chainId: ChainId.Base,
    L1contract: '0xae78736cd615f374d3085123a210448e74fc6393',
    L2contract: '0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c',
    L1icon: '/svgs/rocket-pool-eth.svg',
    L2icon: '/svgs/rocket-pool-eth.svg',
    L1name: 'Rocket Pool ETH',
    L2name: 'Rocket Pool ETH',
    decimals: 18,
    protocol: 'OP',
  },
  {
    L1symbol: 'SOFI',
    L2symbol: 'SOFI',
    L1chainId: ChainId.Mainnet,
    L2chainId: ChainId.Base,
    L1contract: '0xB49fa25978abf9a248b8212Ab4b87277682301c0',
    L2contract: '0x703D57164CA270b0B330A87FD159CfEF1490c0a5',
    L1icon: '/svgs/sofi.png',
    L2icon: '/svgs/sofi.png',
    L1name: 'Rai.Finance',
    L2name: 'Rai.Finance',
    decimals: 18,
    protocol: 'OP',
  },
  {
    L1symbol: 'ZRX',
    L2symbol: 'ZRX',
    L1chainId: ChainId.Mainnet,
    L2chainId: ChainId.Base,
    L1contract: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
    L2contract: '0x3bB4445D30AC020a84c1b5A8A2C6248ebC9779D0',
    L1icon: '/svgs/0x.svg',
    L2icon: '/svgs/0x.svg',
    L1name: '0x Protocol Token',
    L2name: '0x Protocol Token',
    decimals: 18,
    protocol: 'OP',
  },
  {
    L1symbol: 'SUSHI',
    L2symbol: 'SUSHI',
    L1chainId: ChainId.Mainnet,
    L2chainId: ChainId.Base,
    L1contract: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
    L2contract: '0x7D49a065D17d6d4a55dc13649901fdBB98B2AFBA',
    L1icon: '/svgs/sushi.svg',
    L2icon: '/svgs/sushi.svg',
    L1name: 'SushiToken',
    L2name: 'SushiToken',
    decimals: 18,
    protocol: 'OP',
  },
  {
    L1symbol: 'CRV',
    L2symbol: 'CRV',
    L1chainId: ChainId.Mainnet,
    L2chainId: ChainId.Base,
    L1contract: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    L2contract: '0x8Ee73c484A26e0A5df2Ee2a4960B789967dd0415',
    L1icon: '/svgs/curve.svg',
    L2icon: '/svgs/curve.svg',
    L1name: 'Curve DAO Token',
    L2name: 'Curve DAO Token',
    decimals: 18,
    protocol: 'OP',
  },
  {
    L1symbol: '1INCH',
    L2symbol: '1INCH',
    L1chainId: ChainId.Mainnet,
    L2chainId: ChainId.Base,
    L1contract: '0x111111111117dC0aa78b770fA6A738034120C302',
    L2contract: '0xc5fecC3a29Fb57B5024eEc8a2239d4621e111CBE',
    L1icon: '/svgs/1inch.svg',
    L2icon: '/svgs/1inch.svg',
    L1name: '1INCH Token',
    L2name: '1INCH Token',
    decimals: 18,
    protocol: 'OP',
  },
  {
    L1symbol: 'WAMPL',
    L2symbol: 'WAMPL',
    L1chainId: ChainId.Mainnet,
    L2chainId: ChainId.Base,
    L1contract: '0xEDB171C18cE90B633DB442f2A6F72874093b49Ef',
    L2contract: '0x489fe42C267fe0366B16b0c39e7AEEf977E841eF',
    L1icon: '/svgs/wampl.svg',
    L2icon: '/svgs/wampl.svg',
    L1name: 'Wrapped Ampleforth',
    L2name: 'Wrapped Ampleforth',
    decimals: 18,
    protocol: 'OP',
  },
  {
    L1symbol: 'KNC',
    L2symbol: 'KNC',
    L1chainId: ChainId.Mainnet,
    L2chainId: ChainId.Base,
    L1contract: '0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202',
    L2contract: '0x28fe69Ff6864C1C218878BDCA01482D36B9D57b1',
    L1icon: '/svgs/knc.svg',
    L2icon: '/svgs/knc.svg',
    L1name: 'Kyber Network Crystal v2',
    L2name: 'Kyber Network Crystal v2',
    decimals: 18,
    protocol: 'OP',
  },
  {
    L1symbol: 'YFI',
    L2symbol: 'YFI',
    L1chainId: ChainId.Mainnet,
    L2chainId: ChainId.Base,
    L1contract: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
    L2contract: '0x9EaF8C1E34F05a589EDa6BAfdF391Cf6Ad3CB239',
    L1icon: '/svgs/yfi.svg',
    L2icon: '/svgs/yfi.svg',
    L1name: 'yearn.finance',
    L2name: 'yearn.finance',
    decimals: 18,
    protocol: 'OP',
  },
]

export default BRIDGE_ASSETS