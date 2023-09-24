const chains = require('viem/chains')
const fs = require('fs')
const { createPublicClient, http, formatEther, hexToString } = require('viem')
const collateralAbi = require('./data/collateral-abi.json')

// Source of the collaterals json, this comes from the protocol deployment files
const OUTPUT_PATH = './src/utils/plugins/data/'
const FILE_POSTFIX = '-collaterals'

// Wrapped assets has an underlying asset which is the token needed for the deposit
// Aave tokens can wrap directly from non yield token being that the underlying for those the yield bearing token is the collateral
const protocols = {
  AAVE: {
    key: 'AAVE',
    underlying: 'UNDERLYING_ASSET_ADDRESS',
    collateral: 'ATOKEN', // If the underlying is not the yield bearing asset
    rewardTokens: ['stkAAVE'],
  },
  COMP: {
    key: 'COMP',
    underlying: 'underlying',
    rewardTokens: ['COMP'],
  },
  COMPv3: {
    key: 'COMPv3',
    underlying: 'underlyingComet',
    rewardTokens: ['COMP'],
  },
  FLUX: {
    key: 'FLUX',
    underlying: 'underlying',
  },
  MORPHO: {
    key: 'MORPHO',
    underlying: 'underlying',
    collateral: 'poolToken',
  },
  CURVE: {
    key: 'CURVE',
    underlying: 'underlying',
    rewardTokens: ['CRV'],
  },
  CONVEX: {
    key: 'CONVEX',
    underlying: 'convexToken',
    rewardTokens: ['CRV', 'CVX'],
  },
  SDR: {
    key: 'SDR',
    underlying: 'dai',
  },
}

const wrappedTokenMap = {
  aDAI: protocols.AAVE,
  aUSDC: protocols.AAVE,
  aUSDT: protocols.AAVE,
  aBUSD: protocols.AAVE,
  cDAI: protocols.COMP,
  cUSDC: protocols.COMP,
  cUSDT: protocols.COMP,
  cUSDP: protocols.COMP,
  cWBTC: protocols.COMP,
  cETH: protocols.COMP,
  cUSDCv3: protocols.COMPv3,
  fUSDC: protocols.FLUX,
  fUSDT: protocols.FLUX,
  fDAI: protocols.FLUX,
  fFRAX: protocols.FLUX,
  maUSDT: protocols.MORPHO,
  maUSDC: protocols.MORPHO,
  maDAI: protocols.MORPHO,
  maWBTC: protocols.MORPHO,
  maWETH: protocols.MORPHO,
  maStETH: protocols.MORPHO,
  crv3Pool: protocols.CURVE,
  crveUSDFRAXBP: protocols.CURVE,
  crvMIM3Pool: protocols.CURVE,
  cvx3Pool: protocols.CONVEX,
  cvxeUSDFRAXBP: protocols.CONVEX,
  cvxMIM3Pool: protocols.CONVEX,
  sDAI: protocols.SDR,
}

const chainsMap = [
  {
    prefix: 'mainnet',
    chain: {
      ...chains.mainnet,
      rpcUrls: {
        public: { http: ['https://eth.llamarpc.com'] },
        default: { http: ['https://eth.llamarpc.com'] },
      },
    },
    collaterals: require('./data/mainnet-collaterals.json'),
  },
  {
    prefix: 'basegoerli',
    chain: chains.baseGoerli,
    collaterals: require('./data/basegoerli-collaterals.json'),
  },
]

;(async () => {
  console.log('Starting...')

  for (const data of chainsMap) {
    const plugins = []

    const client = createPublicClient({
      chain: data.chain,
      transport: http(),
    })

    for (const collateral of Object.keys(data.collaterals.collateral)) {
      const plugin = {
        address: data.collaterals.collateral[collateral],
      }

      // Fetch data from collateral ASSET contract
      const collateralCall = {
        address: plugin.address,
        abi: collateralAbi,
      }

      const collateralProps = [
        'erc20',
        'chainlinkFeed',
        'delayUntilDefault',
        'maxTradeVolume',
        'oracleTimeout',
        'targetName',
        'version',
      ]

      // Avoid batching because of rate-limiting
      for (const prop of collateralProps) {
        plugin[prop] = await client.readContract({
          ...collateralCall,
          functionName: prop,
        })
        // Format bigints
        if (prop === collateralProps[3]) {
          plugin[prop] = formatEther(plugin[prop])
        }
        if (prop === collateralProps[2]) {
          plugin[prop] = plugin[prop].toString()
        }
        // Format targetName bytes
        if (prop === collateralProps[5]) {
          plugin[prop] = hexToString(plugin[prop], { size: 32 })
        }
      }

      // Fetch data from collateral ERC20 contract
      const erc20Call = {
        address: plugin.erc20,
        abi: collateralAbi,
      }
      plugin.symbol = await client.readContract({
        ...erc20Call,
        functionName: 'symbol',
      })
      plugin.decimals = await client.readContract({
        ...erc20Call,
        functionName: 'decimals',
      })

      // Yield bearing or Pool tokens that requires wrapping
      if (wrappedTokenMap[collateral]) {
        const meta = wrappedTokenMap[collateral]

        // Record protocol for abi mapping
        plugin.protocol = meta.key
        // Map underlying token - the token that the deposit() function requires
        plugin.underlyingAddress = await client.readContract({
          ...erc20Call,
          functionName: meta.underlying,
        })
        plugin.underlyingToken = await client.readContract({
          abi: collateralAbi,
          address: plugin.underlyingAddress,
          functionName: 'symbol',
        })

        // Map collateral which is the yield bearing asset if is not the same as underlying
        if (meta.collateral) {
          plugin.collateralAddress = await client.readContract({
            ...erc20Call,
            functionName: meta.collateral,
          })
          plugin.collateralToken = await client.readContract({
            abi: collateralAbi,
            address: plugin.collateralAddress,
            functionName: 'symbol',
          })
        }
        plugin.rewardTokens = meta.rewardTokens
          ? meta.rewardTokens.map((key) => data.collaterals.assets[key])
          : []
      } else {
        plugin.protocol = 'GENERIC' // TODO: Maybe in the future I want more info about the protocol?
        plugin.rewardTokens = []
      }

      console.log(`${collateral} parsed...`)
      plugins.push(plugin)
    }

    const path = `${OUTPUT_PATH}${data.prefix}.json`
    console.log(`Process finished for "${data.prefix}"`)

    fs.writeFileSync(
      `${OUTPUT_PATH}${data.prefix}.json`,
      JSON.stringify(plugins)
    )
    console.log(`Output saved at: ${path}`)
  }
  console.log('TADA!')
  process.exit()
})()