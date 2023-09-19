import { Address, configuration, Universe } from '@reserve-protocol/token-zapper'
import { PROTOCOL_CONFIGS } from '@reserve-protocol/token-zapper/configuration/ethereum'
import { atom } from 'jotai'
import { loadable } from 'jotai/utils'
import { onlyNonNullAtom, simplifyLoadable } from 'utils/atoms/utils'
import { createProxiedOneInchAggregator } from './createProxiedOneInchAggregator'
import { clientAtom } from 'state/atoms'
import { Web3Provider } from "@ethersproject/providers"
import { PublicClient } from 'viem'

export function publicClientToProvider(publicClient: PublicClient) {
  const { chain } = publicClient
  const network = {
    chainId: chain!.id,
    name: chain!.name,
    ensAddress: chain!.contracts?.ensRegistry?.address,
  }
  return new Web3Provider(async (method, params) => {
    return publicClient.request({
      method,
      params
    } as any)
  }, network)
}

const providerAtom = atom<any>(get => {
  const cli = get(clientAtom)
  if (cli == null) {
    return null
  }
  return publicClientToProvider(cli as any)
})


// TODO: Convert provider viem -> ethers
export const connectionName = onlyNonNullAtom((get) => {
  return get(providerAtom).connection.url
})

const PERMIT2_SUPPORTED_CONNECTIONS = new Set(['metamask'])

export const supportsPermit2Signatures = onlyNonNullAtom((get) => {
  return PERMIT2_SUPPORTED_CONNECTIONS.has(get(connectionName))
})

const ONE_INCH_PROXIES = [
  'https://cold-mouse-7d43.mig2151.workers.dev/',
  'https://blue-cake-3548.mig2151.workers.dev/',
  'https://bitter-tree-ed5a.mig2151.workers.dev/',
  'https://square-morning-0921.mig2151.workers.dev/',
]

const convertWrapperTokenAddressesIntoWrapperTokenPairs = async (
  universe: Universe,
  markets: string[],
  underlyingTokens: { [address: string]: string; }
) => {
  return await Promise.all(
    markets
      .map(Address.from)
      .map(async (address) => {
        const [underlying, wrappedToken] = await Promise.all([
          universe.getToken(Address.from(underlyingTokens[address.address])),
          universe.getToken(address),
        ]);
        return { underlying, wrappedToken };
      })
  );
};

const COMMON_TOKENS = {
  USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
  WBTC: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  ERC20GAS: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  MIM: "0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3",
  FRAX: "0x853d955acef822db058eb8505911ed77f175b99e",

  "eUSD3CRV-f": "0xAEda92e6A3B1028edc139A4ae56Ec881f3064D4F",
  "MIM-3LP3CRV-f": "0x5a6A4D54456819380173272A5E8E9B9904BdF41B",
  "3CRV": "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",

  "stkcvxeUSD3CRV-f": "0xBF2FBeECc974a171e319b6f92D8f1d042C6F1AC3",
  "stkcvxMIM-3LP3CRV-f": "0x8443364625e09a33d793acd03aCC1F3b5DbFA6F6",
  "stkcvx3Crv": "0xee0ac49885719DBF5FC1CDAFD9c752127E009fFa",

  "cBAT": "0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E",
  "cDAI": "0xF5DCe57282A584D2746FaF1593d3121Fcac444dC",
  "cREP": "0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1",
  "cUSDC": "0x39AA39c021dfbaE8faC545936693aC917d5E7563",
  "cUSDT": "0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9",
  "cWBTC": "0xccF4429DB6322D5C611ee964527D42E5d685DD6a",
  "cZRX": "0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407",
  "cUNI": "0x35A18000230DA775CAc24873d00Ff85BccdeD550",
  "cCOMP": "0x70e36f6BF80a52b3B46b3aF8e106CC0ed743E8e4",
  "cTUSD": "0x12392F67bdf24faE0AF363c24aC620a2f67DAd86",
  "cLINK": "0xFAce851a4921ce59e912d19329929CE6da6EB0c7",
  "cMKR": "0x95b4eF2869eBD94BEb4eEE400a99824BF5DC325b",
  "cSUSHI": "0x4B0181102A0112A2ef11AbEE5563bb4a3176c9d7",
  "cAAVE": "0xe65cdB6479BaC1e22340E4E755fAE7E509EcD06c",
  "cYFI": "0x80a2AE356fc9ef4305676f7a3E2Ed04e12C33946",
  "cUSDP": "0x041171993284df560249B57358F931D9eB7b925D",
  "cFEI": "0x7713DD9Ca933848F6819F38B8352D9A15EA73F67",

  "fOUSG": "0x1dD7950c266fB1be96180a8FDb0591F70200E018",
  "fUSDC": "0x465a5a630482f3abD6d3b84B39B29b07214d19e5",
  "fDAI": "0xe2bA8693cE7474900A045757fe0efCa900F6530b",
  "fUSDT": "0x81994b9607e06ab3d5cF3AffF9a67374f05F27d7",
  "fFRAX": "0x1C9A2d6b33B4826757273D47ebEe0e2DddcD978B",

  "saUSDT": "0x21fe646D1Ed0733336F2D4d9b2FE67790a6099D9",
  "saDAI": "0xF6147b4B44aE6240F7955803B2fD5E15c77bD7ea",
  "saUSDC": "0x60C384e226b120d93f3e0F4C502957b2B9C32B15"
} as const;

const RTOKENS = {
  eUSD: {
    main: '0x7697aE4dEf3C3Cd52493Ba3a6F57fc6d8c59108a',
    erc20: "0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F"
  },
  'ETH+': {
    main: '0xb6A7d481719E97e142114e905E86a39a2Fa0dfD2',
    erc20: "0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8"
  },
  hyUSD: {
    main: '0x2cabaa8010b3fbbDEeBe4a2D0fEffC2ed155bf37',
    erc20: "0xaCdf0DBA4B9839b96221a8487e9ca660a48212be"
  },
  RSD: {
    main: '0xa410AA8304CcBD53F88B4a5d05bD8fa048F42478',
    erc20: "0xF2098092a5b9D25A3cC7ddc76A0553c9922eEA9E"
  }
} as const;


const GAS_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const CHAINLINK_BTC_TOKEN_ADDRESS = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB"
const wrappedToUnderlyingMapping = {
  "0xabB54222c2b77158CC975a2b715a3d703c256F05": "0x5a6A4D54456819380173272A5E8E9B9904BdF41B",
  "0x8443364625e09a33d793acd03aCC1F3b5DbFA6F6": "0xabB54222c2b77158CC975a2b715a3d703c256F05",
  "0x8e074d44aaBC1b3b4406fE03Da7ceF787ea85938": "0xAEda92e6A3B1028edc139A4ae56Ec881f3064D4F",
  "0xBF2FBeECc974a171e319b6f92D8f1d042C6F1AC3": "0x8e074d44aaBC1b3b4406fE03Da7ceF787ea85938",
  "0x30D9410ED1D5DA1F6C8391af5338C93ab8d4035C": "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
  "0xee0ac49885719DBF5FC1CDAFD9c752127E009fFa": "0x30D9410ED1D5DA1F6C8391af5338C93ab8d4035C",
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  "0x1dD7950c266fB1be96180a8FDb0591F70200E018": "0x1B19C19393e2d034D8Ff31ff34c81252FcBbee92",
  "0x465a5a630482f3abD6d3b84B39B29b07214d19e5": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "0xe2bA8693cE7474900A045757fe0efCa900F6530b": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  "0x81994b9607e06ab3d5cF3AffF9a67374f05F27d7": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  "0x1C9A2d6b33B4826757273D47ebEe0e2DddcD978B": "0x853d955aCEf822Db058eb8505911ED77F175b99e",
  "0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E": "0x0D8775F648430679A709E98d2b0Cb6250d2887EF",
  "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  "0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1": "0x1985365e9f78359a9B6AD760e32412f4a445E862",
  "0x39AA39c021dfbaE8faC545936693aC917d5E7563": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  "0xC11b1268C1A384e55C48c2391d8d480264A3A7F4": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  "0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407": "0xE41d2489571d322189246DaFA5ebDe1F4699F498",
  "0xF5DCe57282A584D2746FaF1593d3121Fcac444dC": "0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359",
  "0x35A18000230DA775CAc24873d00Ff85BccdeD550": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  "0x70e36f6BF80a52b3B46b3aF8e106CC0ed743E8e4": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
  "0xccF4429DB6322D5C611ee964527D42E5d685DD6a": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  "0x12392F67bdf24faE0AF363c24aC620a2f67DAd86": "0x0000000000085d4780B73119b644AE5ecd22b376",
  "0xFAce851a4921ce59e912d19329929CE6da6EB0c7": "0x514910771AF9Ca656af840dff83E8264EcF986CA",
  "0x95b4eF2869eBD94BEb4eEE400a99824BF5DC325b": "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
  "0x4B0181102A0112A2ef11AbEE5563bb4a3176c9d7": "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2",
  "0xe65cdB6479BaC1e22340E4E755fAE7E509EcD06c": "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
  "0x80a2AE356fc9ef4305676f7a3E2Ed04e12C33946": "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e",
  "0x041171993284df560249B57358F931D9eB7b925D": "0x8E870D67F660D95d5be530380D0eC0bd388289E1",
  "0x7713DD9Ca933848F6819F38B8352D9A15EA73F67": "0x956F47F50A910163D8BF957Cf5846D573E7f87CA",
  "0x21fe646D1Ed0733336F2D4d9b2FE67790a6099D9": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  "0x60C384e226b120d93f3e0F4C502957b2B9C32B15": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "0xF6147b4B44aE6240F7955803B2fD5E15c77bD7ea": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  "0xae78736Cd615f374D3085123A210448E74Fc6393": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0": "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
  "0xafd16aFdE22D42038223A6FfDF00ee49c8fDa985": "0x6B175474E89094C44Da98b954EedeAC495271d0F"
}
export const zapperState = loadable(
  atom(async (get) => {
    const provider = get(providerAtom)

    // To inject register data into the zapper initialize code, it's probably best to load it all here.
    // Makre sure that thedata does not change after this point as we don't want to trigger updates

    if (provider == null) {
      return null
    }

    try {
      const ethereumConfig = configuration.makeConfig(
        1,
        {
          symbol: 'ETH',
          decimals: 18,
          name: 'Ether',
        },
        COMMON_TOKENS,
        RTOKENS,
        {
          zapperAddress: '0xfa81b1a2f31786bfa680a9B603c63F25A2F9296b',
          executorAddress: '0x7fA27033835d48ea32feB34Ab7a66d05bf38DE11',
        }
      );
      const universe = await Universe.createWithConfig(
        provider,
        ethereumConfig,
        async (universe) => {
          const { loadEthereumTokenList } = await import('@reserve-protocol/token-zapper/configuration/setupEthereumTokenList');
          const { setupCompoundLike } = await import('@reserve-protocol/token-zapper/protocols/compoundV2');
          const { loadRTokens } = await import('@reserve-protocol/token-zapper/protocols/reserve');
          const { setupSAToken } = await import('@reserve-protocol/token-zapper/protocols/aaveV2');
          const { setupLido } = await import('@reserve-protocol/token-zapper/protocols/lido');
          const { setupRETH } = await import('@reserve-protocol/token-zapper/protocols/rocketpool');
          const { setupChainLink: setupChainLinkRegistry } = await import('@reserve-protocol/token-zapper/protocols/chainlink');
          const { setupWrappedGasToken } = await import('@reserve-protocol/token-zapper/protocols/erc20gas');
          const { initCurveOnEthereum } = await import('@reserve-protocol/token-zapper/protocols/curve/mainnet');


          await loadEthereumTokenList(universe)

          const chainLinkETH = Address.from(GAS_TOKEN_ADDRESS)
          const chainLinkBTC = Address.from(CHAINLINK_BTC_TOKEN_ADDRESS)

          setupChainLinkRegistry(
            universe,
            PROTOCOL_CONFIGS.chainLinkRegistry,
            [
              [universe.commonTokens.WBTC, chainLinkBTC],
              [universe.commonTokens.WETH, chainLinkETH],
              [universe.nativeToken, chainLinkETH],
            ]
          );
          setupWrappedGasToken(
            universe
          )

          // Set up compound
          const cTokens = await convertWrapperTokenAddressesIntoWrapperTokenPairs(
            universe,
            PROTOCOL_CONFIGS.compound.markets,
            wrappedToUnderlyingMapping
          )
          await setupCompoundLike(universe, {
            cEth: await universe.getToken(
              Address.from(PROTOCOL_CONFIGS.compound.cEther)
            ),
            comptroller: Address.from(PROTOCOL_CONFIGS.compound.comptroller),
          }, cTokens)



          // Set up flux finance
          const fTokens = await convertWrapperTokenAddressesIntoWrapperTokenPairs(
            universe,
            PROTOCOL_CONFIGS.fluxFinance.markets,
            wrappedToUnderlyingMapping
          )

          await setupCompoundLike(universe, {
            comptroller: Address.from(PROTOCOL_CONFIGS.fluxFinance.comptroller),
          }, fTokens)

          // Set up AAVEV2
          const saTokens = await convertWrapperTokenAddressesIntoWrapperTokenPairs(
            universe,
            PROTOCOL_CONFIGS.aavev2.tokenWrappers,
            wrappedToUnderlyingMapping
          );
          await Promise.all(saTokens.map(({ underlying, wrappedToken }) => setupSAToken(
            universe,
            wrappedToken,
            underlying,
          )))

          // Set up RETH
          await setupRETH(
            universe as any,
            PROTOCOL_CONFIGS.rocketPool.reth,
            PROTOCOL_CONFIGS.rocketPool.router,
          )

          // Set up Lido
          await setupLido(
            universe,
            PROTOCOL_CONFIGS.lido.steth,
            PROTOCOL_CONFIGS.lido.wsteth,
          )

          // Set up RTokens defined in the config
          await loadRTokens(universe)

          try {
            await initCurveOnEthereum(universe as any, PROTOCOL_CONFIGS.convex.booster)
          } catch (e) {
            console.log(e)
          }
        }
      )
      try {
        if (ONE_INCH_PROXIES.length !== 0) {
          universe.dexAggregators.push(
            createProxiedOneInchAggregator(universe, ONE_INCH_PROXIES)
          )
        }
      } catch (e) {
        console.log(e)
      }

      return universe
    } catch (e) {
      console.log(e)
      throw e
    }
  })
)

export const resolvedZapState = simplifyLoadable(zapperState)

export const zappableTokens = atom((get) => {
  const uni = get(resolvedZapState)
  if (uni == null) {
    return []
  }
  return [
    uni.nativeToken,
    uni.commonTokens.USDC,
    uni.commonTokens.USDT,
    uni.commonTokens.DAI,
    uni.commonTokens.WBTC,
    uni.commonTokens.WETH,
    uni.commonTokens.MIM,
    uni.commonTokens.FRAX,
  ].filter((tok) => tok != null)
})
