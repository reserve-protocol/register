import collateralPlugins from 'utils/plugins'
import CollateralAbi from 'abis/CollateralAbi'
import OracleAbi from 'abis/OracleAbi'
import {
  formatEther,
  formatUnits,
  hexConcat,
  hexValue,
  hexZeroPad,
  parseUnits,
  solidityKeccak256,
} from 'ethers/lib/utils'
import { BigNumber, ethers } from 'ethers'
import AssetAbi from 'abis/AssetAbi'

// If a new fork is deployed we will have to update this address..
const timeStampContract = "0x48Bf69757404ee1386a1683364a5C3f1CC0AA6ad"

/**
 * This piece of code can be used to directly modify oracles in our forked envs.
 * 
 * @usage
 * Start by loading the dev tool:
 * Open the dev console in your browser:
 * ```
 * oracles = await window.__reserveDevTools('https://rpc.tenderly.co/fork/....')
 * // For local use, you can set the VITE_TENDERLY_URL env variable
 * oracles = await window.__reserveDevTools()
 * 
 * // Set the price of a specific oracle (set BTC price to 30k)
 * await oracles.oracles['BTC / USD'].setPrice(30000)
 * 
 * // If you don't care about the price and just want to make the price not stale:
 * await oracles.oracles['BTC / USD'].makePriceRecent()
 * 
 * // Make all oracles recent:
 * await oracles.makeAllPricesRecent()
 * ```
 */

const DEFAULT_TENDERLY_URL: string = import.meta.env.VITE_TENDERLY_URL ?? ''

// Add new oracles here for future use
const oraclesToLoad = [] as string[];

const oracles = [
  {
    "name": "RSR / USD",
    "oracleDecimals": 8,
    "aggregator": "0xA27CfD69345a6e121284a3C0ae07BB64b707cDD2",
    "chainLinkFeed": "0x759bbc1be8f90ee6457c44abc7d443842a976d02"
  },
  {
    "name": "DAI / USD",
    "oracleDecimals": 8,
    "aggregator": "0x478238a1c8B862498c74D0647329Aef9ea6819Ed",
    "chainLinkFeed": "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
  },
  {
    "name": "USDC / USD",
    "oracleDecimals": 8,
    "aggregator": "0x789190466E21a8b78b8027866CBBDc151542A26C",
    "chainLinkFeed": "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
  },
  {
    "name": "USDT / USD",
    "oracleDecimals": 8,
    "aggregator": "0xa964273552C1dBa201f5f000215F5BD5576e8f93",
    "chainLinkFeed": "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
  },
  {
    "name": "BUSD / USD",
    "oracleDecimals": 8,
    "aggregator": "0x73dc1b226f7DfAc353bdB41A27C4212213e6aF07",
    "chainLinkFeed": "0x833D8Eb16D306ed1FbB5D7A2E019e106B960965A",
  },
  {
    "name": "USDP / USD",
    "oracleDecimals": 8,
    "aggregator": "0xF3d70857B489Ecc6768D0982B773E1Cba9E1f00b",
    "chainLinkFeed": "0x09023c0DA49Aaf8fc3fA3ADF34C6A7016D38D5e3",
  },
  {
    "name": "TUSD / USD",
    "oracleDecimals": 8,
    "aggregator": "0x98953e9C76573e06ec265Bdde1dbB89fa02d56d3",
    "chainLinkFeed": "0xec746eCF986E2927Abd291a2A1716c940100f8Ba",
  },
  {
    "name": "sUSD / USD",
    "oracleDecimals": 8,
    "aggregator": "0x1187272A0E3A603eC4734CeC73a0880055eCC593",
    "chainLinkFeed": "0xad35Bd71b9aFE6e4bDc266B345c198eaDEf9Ad94",
  },
  {
    "name": "FRAX / USD",
    "oracleDecimals": 8,
    "aggregator": "0x61eB091ea16A32ea5B880d0b3D09d518c340D750",
    "chainLinkFeed": "0xB9E1E3A9feFf48998E45Fa90847ed4D467E8BcfD",
  },
  {
    "name": "MIM / USD",
    "oracleDecimals": 8,
    "aggregator": "0x18f0112E30769961AF90FDEe0D1c6B27E6d72D92",
    "chainLinkFeed": "0x7A364e8770418566e3eb2001A96116E6138Eb32F",
  },
  {
    "name": "ETH / USD",
    "oracleDecimals": 8,
    "aggregator": "0xE62B71cf983019BFf55bC83B48601ce8419650CC",
    "chainLinkFeed": "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
  },
  {
    "name": "BTC / USD",
    "oracleDecimals": 8,
    "aggregator": "0xdBe1941BFbe4410D6865b9b7078e0b49af144D2d",
    "chainLinkFeed": "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
  },
  {
    "name": "EURT / USD",
    "oracleDecimals": 8,
    "aggregator": "0x920E5DC12E7500c6571C63D4Bba19c62e99d6883",
    "chainLinkFeed": "0x01D391A48f4F7339aC64CA2c83a07C22F95F587a",
  },
  {
    "name": "EUR / USD",
    "oracleDecimals": 8,
    "aggregator": "0x02F878A94a1AE1B15705aCD65b5519A46fe3517e",
    "chainLinkFeed": "0xb49f677943BC038e9857d61E7d053CaA2C1734C1",
  },
  {
    "name": "STETH / ETH",
    "oracleDecimals": 18,
    "aggregator": "0x716BB759A5f6faCdfF91F0AfB613133d510e1573",
    "chainLinkFeed": "0x86392dc19c0b719886221c78ab11eb8cf5c52812",
  },
  {
    "name": "STETH / USD",
    "oracleDecimals": 8,
    "aggregator": "0xdA31bc2B08F22AE24aeD5F6EB1E71E96867BA196",
    "chainLinkFeed": "0xCfE54B5cD566aB89272946F602D76Ea879CAb4a8",
  },
  {
    "name": "RETH / ETH",
    "oracleDecimals": 18,
    "aggregator": "0x9cB248E68fb81d0CFE7D6B3265Fe6Bf123A71FE0",
    "chainLinkFeed": "0x536218f9E9Eb48863970252233c8F271f554C2d0",
  },
  {
    "name": "CBETH / ETH",
    "oracleDecimals": 18,
    "aggregator": "0xd74FF3f1b565597E59D44320F53a5C5c8BA85f7b",
    "chainLinkFeed": "0xf017fcb346a1885194689ba23eff2fe6fa5c483b",
  },
  {
    "name": "WBTC / BTC",
    "oracleDecimals": 8,
    "aggregator": "0xD7623f1d24b35c392862fB67C9716564A117C9DE",
    "chainLinkFeed": "0xfdFD9C85aD200c506Cf9e21F1FD8dd01932FBB23",
  }
];


const eUSDCollats = [
  "0x90b8cfCb8645e2E518A20060daF7c482Ec7d0971",
  "0x7FDbE32980861CC63751a0aEa5a5b3Ecb5119ACD",
  "0x8a01936B12bcbEEC394ed497600eDe41D409a83F",
  "0x69Bd37B82794d64DC0C8c9652a6151f8954fD378",
  "0x9837Ce9825D52672Ca02533B5A160212bf901963",
  "0x8960ae89C8fEe76515c1Fa5DAbc100996E143798",
  "0x77CFE9fe00D45DF94a18aB34Af451199aAab2b5e",
  "0xFDC36294aF736122456687D14DE7d42598319b7C",
  "0x95171C5C8602F889fD052e978B4B2a8D56e357a5",
  "0xE5a1da41af2919A43daC3ea22C2Bdd230a3E19f5",
];


; (window as never as any).__reserveDevToolsUndefaultCollaterals = async (
  tenderlyUrl: string = DEFAULT_TENDERLY_URL,
) => {

  const provider = new ethers.providers.JsonRpcProvider(tenderlyUrl)
  const chainId = await provider.getNetwork().then((v) => v.chainId)
  const plugins = collateralPlugins[chainId]
  await Promise.all(
    plugins.map(i => i.address).concat(eUSDCollats).map(async (addr) => {
      const prev = BigInt(await provider.getStorageAt(addr, hexZeroPad(hexValue(2), 32)))

      // _whenDefault seems to always go in the 2nd slot
      // If we're dealing with an appreciating asset, then the exposed reference price
      // is put in the first 192bits of the 2nd slot.

      // So we leave the first 192bits alone and only set the lower 64bits to 0xffffffffffff
      // This is the same as resetting the status of the plugin as it is the same as setting the
      // _whenDefault variable to the constant NEVER
      const newEntry = (prev & ~(0xffffffffffffn)) | 0xffffffffffffn;
      await provider.send('tenderly_setStorageAt', [
        addr,
        hexZeroPad(hexValue(2), 32),
        hexZeroPad('0x'+newEntry.toString(16), 32)
      ])
    })
  )
}

const loadOracleFromAddress = async (oracle: string, provider: ethers.providers.JsonRpcProvider) => {
  const oracleContract = new ethers.Contract(oracle, OracleAbi, provider)
  const [priceBN, aggregator, decimals, name]: [
    BigNumber,
    string,
    number,
    string
  ] = await Promise.all([
    oracleContract.callStatic.latestAnswer().catch(() => BigNumber.from(0)),
    oracleContract.callStatic.aggregator().catch(() => null),
    oracleContract.callStatic.decimals().catch(() => 0),
    oracleContract.callStatic.description().catch(() => '???'),
  ])


  const oracleInst = {
    name: name,
    oracleDecimals: decimals,
    aggregator,
    chainLinkFeed: oracle,
    oraclePrice: parseFloat(formatUnits(priceBN, decimals)),
    slot: Promise.resolve(null) as Promise<null | {
      roundId: BigNumber,
    }>,
  }
  const aggregatorOracle = new ethers.Contract(aggregator, OracleAbi, provider)
  oracleInst.slot = (async () => {
    const roundId = await aggregatorOracle.callStatic
      .latestRound({ from: oracle })
      .catch(() => null)
    if (roundId == null) {
      console.error('No round id for', oracleInst.name)
      return null
    }


    Object.assign(
      oracleInst,
      {
        roundId,
      }
    )

    return {
      roundId,
    }
  })()


  return oracleInst
}


  ; (window as never as any).__reserveDevTools = async (
    tenderlyUrl: string = DEFAULT_TENDERLY_URL
  ) => {
    console.log('Using tenderly url', tenderlyUrl)
    const provider = new ethers.providers.JsonRpcProvider(tenderlyUrl)
    const chainId = await provider.getNetwork().then((v) => v.chainId)
    const plugins = collateralPlugins[chainId]


    const data = await Promise.all(
      oraclesToLoad.map(oracleAddr => loadOracleFromAddress(oracleAddr, provider))
    )
    data.push(
      ...(await Promise.all(
        oracles.map(async oracle => {
          const aggregatorOracle = new ethers.Contract(oracle.aggregator, OracleAbi, provider)
          const [roundId, price] = await Promise.all([
            aggregatorOracle.callStatic
              .latestRound({ from: oracle.chainLinkFeed }).catch(() => null),
            aggregatorOracle.callStatic.latestAnswer().catch(() => null),
          ]);

          return {
            ...oracle,
            roundId,
            oraclePrice: price == null ? 0 : parseFloat(formatUnits(price, oracle.oracleDecimals)),
            slot: Promise.resolve({
              roundId,
            })
          }
        })
      ))
    )

    const timestamp = BigInt(await provider.call({
      to: timeStampContract,
      data: '0xb80777ea',
    })) - 100n

    console.log("Current timestamp on fork is ", new Date(Number(timestamp) * 1000).toLocaleString(), "according to the timestamp contract")

    const updateOracleData = async (
      oracle: (typeof data)[0],
      newPrice: string,
    ) => {
      if (oracle.chainLinkFeed == null) {
        console.error('No chainlink feed for', oracle.name)
        return
      }
      const oracleContract = new ethers.Contract(
        oracle.chainLinkFeed,
        OracleAbi,
        provider
      )


      if (oracle.aggregator == null) {
        console.error('No aggregator for', oracle.name)
        return
      }

      const slot = await oracle.slot
      if (slot == null) {
        console.error('No slot for', oracle.name)
        return
      }

      const newEntry = hexConcat([
        hexZeroPad(hexValue(timestamp), 8),
        hexZeroPad(
          parseUnits(newPrice, oracle.oracleDecimals).toHexString(),
          24
        ),
      ])

      const nthTransmission = hexZeroPad(hexValue(slot.roundId.toNumber()), 32)
      for (let i = 40; i <= 45; i++) {
        const transmissionsSlot = hexZeroPad(hexValue(i), 32)
        const key = solidityKeccak256(
          ['bytes32', 'bytes32'],
          [nthTransmission, transmissionsSlot]
        )
        await provider.send('tenderly_setStorageAt', [
          oracle.aggregator,
          key,
          newEntry
        ])
      }

      const latestAnswer = await oracleContract.callStatic
        .latestAnswer()
        .catch(() => null)


      oracle.oraclePrice =
        latestAnswer == null
          ? 0
          : parseFloat(formatUnits(latestAnswer, oracle.oracleDecimals))

      console.log(oracle.name, 'new oracle price', oracle.oraclePrice)
    }
    const loadPluginState = async () =>
      Object.fromEntries(
        await Promise.all(
          plugins.map(async (plug) => {
            const collateralContract = new ethers.Contract(
              plug.address,
              CollateralAbi,
              provider
            )
            const assetContract = new ethers.Contract(
              plug.address,
              AssetAbi,
              provider
            )

            const [price, status] = await Promise.all([
              assetContract.callStatic.tryPrice().catch(e => {
                console.log(plug.address, 'failed to get price')
                console.info("Oracle potentially stale, try running makeAllPricesRecent()")
                return [BigNumber.from(0), BigNumber.from(0)]
              }),
              collateralContract.callStatic.status().catch(() => null),
            ])

            return [
              plug.address,
              {
                name: plug.symbol,
                address: plug.address,
                high: formatEther(price[0]),
                low: formatEther(price[1]),
                status,
              },
            ] as const
          })
        )
      )

    const pluginState = {} //await loadPluginState()

    const printState = () => {
      console.log('ORACLES:')
      console.table(data)
      if (Object.keys(pluginState).length !== 0) {
        console.log('PLUGINS:')
        console.table(Object.values(pluginState))
      }
    }

    void loadPluginState().then(state => {
      Object.assign(pluginState, state)
      printState()
    })
    printState()
    console.log('\nUse return value to modify oracles.\n')
    return {
      refreshData: async () => {
        Object.assign(pluginState, await loadPluginState())
        printState()
      },
      printState,
      dumpState: () => {
        console.log(JSON.stringify(data.map(oracle => ({
          name: oracle.name,
          oracleDecimals: oracle.oracleDecimals,
          aggregator: oracle.aggregator,
          chainLinkFeed: oracle.chainLinkFeed,
        }))))
      },
      plugins: pluginState,
      oracles: Object.fromEntries(
        data.map((oracle) => [
          oracle.name,
          {
            price: oracle.oraclePrice,
            makePriceRecent: async () =>
              updateOracleData(oracle, oracle.oraclePrice.toString()),
            setPrice: async (newPrice: string) =>
              updateOracleData(oracle, newPrice),
          },
        ])
      ),
      makeAllPricesRecent: async () => {
        for (const oracle of data) {
          await updateOracleData(oracle, oracle.oraclePrice.toString())
        }
      }
    }
  }


