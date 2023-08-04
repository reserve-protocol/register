// import { useAtomValue } from 'jotai'
// import { useEffect } from 'react'
// import { chainIdAtom } from 'state/atoms'
// import { ChainId } from 'utils/chains'
// import { usePublicClient } from 'wagmi'

// const oracles = [
//   {
//     name: 'DAI / USD',
//     oracleDecimals: 8,
//     aggregator: '0x478238a1c8B862498c74D0647329Aef9ea6819Ed',
//     chainLinkFeed: '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9',
//     oraclePrice: 0.999964,
//     slotIndex: 44,
//     slotData:
//       '0x0000000064c844d7000000000000000000000000000000000000000005f5d2f0',
//     key: '0x052ea34f3f657acc21d4441197e40ba845c0cdf4f2a3865fd600e653ee534f46',
//   },
//   {
//     name: 'USDC / USD',
//     oracleDecimals: 8,
//     aggregator: '0x789190466E21a8b78b8027866CBBDc151542A26C',
//     chainLinkFeed: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
//     oraclePrice: 0.999967,
//     slotIndex: 43,
//     slotData:
//       '0x0000000064c844dc000000000000000000000000000000000000000005f5d41c',
//     key: '0x97ec7ac322a58b3aa73cd4b16fc9b82cfa09f4f9a125da28583a6a1b3b0faa7e',
//   },
//   {
//     name: 'USDT / USD',
//     oracleDecimals: 8,
//     aggregator: '0xa964273552C1dBa201f5f000215F5BD5576e8f93',
//     chainLinkFeed: '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D',
//     oraclePrice: 1,
//     slotIndex: 43,
//     slotData:
//       '0x0000000064c844e0000000000000000000000000000000000000000005f5e100',
//     key: '0x1a7c1940cd2bdc8ef24681ad8764d6e803d9aba03bb7d055bb9ab0496312b569',
//   },
//   {
//     name: 'BUSD / USD',
//     oracleDecimals: 8,
//     aggregator: '0x73dc1b226f7DfAc353bdB41A27C4212213e6aF07',
//     chainLinkFeed: '0x833D8Eb16D306ed1FbB5D7A2E019e106B960965A',
//     oraclePrice: 1.000185,
//     slotIndex: 43,
//     slotData:
//       '0x0000000064c844e4000000000000000000000000000000000000000005f62944',
//     key: '0x4857466f41bb321eaf9d5563d2e136558d11c4b400e1231b2f1ba2d8217602f3',
//   },
//   {
//     name: 'USDP / USD',
//     oracleDecimals: 8,
//     aggregator: '0xF3d70857B489Ecc6768D0982B773E1Cba9E1f00b',
//     chainLinkFeed: '0x09023c0DA49Aaf8fc3fA3ADF34C6A7016D38D5e3',
//     oraclePrice: 0.99933368,
//     slotIndex: 43,
//     slotData:
//       '0x0000000064c844e9000000000000000000000000000000000000000005f4dcb8',
//     key: '0x18a7400d2a47bfa8714497a9cfa221ad9b442f268b53b6d16a42ca6211f77229',
//   },
//   {
//     name: 'TUSD / USD',
//     oracleDecimals: 8,
//     aggregator: '0x98953e9C76573e06ec265Bdde1dbB89fa02d56d3',
//     chainLinkFeed: '0xec746eCF986E2927Abd291a2A1716c940100f8Ba',
//     oraclePrice: 0.999456,
//     slotIndex: 44,
//     slotData:
//       '0x0000000064c844ee000000000000000000000000000000000000000005f50c80',
//     key: '0xdc6939608bc9efedf9a0b123dc5860b4c40e29480b271106914da011d4d8d68e',
//   },
//   {
//     name: 'sUSD / USD',
//     oracleDecimals: 8,
//     aggregator: '0x1187272A0E3A603eC4734CeC73a0880055eCC593',
//     chainLinkFeed: '0xad35Bd71b9aFE6e4bDc266B345c198eaDEf9Ad94',
//     oraclePrice: 0.99943428,
//     slotIndex: 43,
//     slotData:
//       '0x0000000064c844f2000000000000000000000000000000000000000005f50404',
//     key: '0xd1a6920cdba58b1cc233238b350ae3c9d026638ebed0ccee078d87baa8d7578c',
//   },
//   {
//     name: 'FRAX / USD',
//     oracleDecimals: 8,
//     aggregator: '0x61eB091ea16A32ea5B880d0b3D09d518c340D750',
//     chainLinkFeed: '0xB9E1E3A9feFf48998E45Fa90847ed4D467E8BcfD',
//     oraclePrice: 1,
//     slotIndex: 44,
//     slotData:
//       '0x0000000064c844f7000000000000000000000000000000000000000005f5e100',
//     key: '0x157bb3fb48820d3cbab5541381835e8fb7ea72d521f65c2a705d135787cc5573',
//   },
//   {
//     name: 'MIM / USD',
//     oracleDecimals: 8,
//     aggregator: '0x18f0112E30769961AF90FDEe0D1c6B27E6d72D92',
//     chainLinkFeed: '0x7A364e8770418566e3eb2001A96116E6138Eb32F',
//     oraclePrice: 1,
//     slotIndex: 44,
//     slotData:
//       '0x0000000064c844fc000000000000000000000000000000000000000005f5e100',
//     key: '0x4bc1026a750ae9fc823990ea0eb7abf565f81c3b58e44d3bcd9a45298e73116e',
//   },
//   {
//     name: 'ETH / USD',
//     oracleDecimals: 8,
//     aggregator: '0xE62B71cf983019BFf55bC83B48601ce8419650CC',
//     chainLinkFeed: '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419',
//     oraclePrice: 1870,
//     slotIndex: 44,
//     slotData:
//       '0x0000000064c84501000000000000000000000000000000000000002b8a118e00',
//     key: '0xfc44effa9a2e5a31c1e2f081b72fc386f49d4bde751add4974a8b05c37f33db1',
//   },
//   {
//     name: 'BTC / USD',
//     oracleDecimals: 8,
//     aggregator: '0xdBe1941BFbe4410D6865b9b7078e0b49af144D2d',
//     chainLinkFeed: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
//     oraclePrice: 30000,
//     slotIndex: 44,
//     slotData:
//       '0x0000000064c8450600000000000000000000000000000000000002ba7def3000',
//     key: '0x315ba277acd4cfa10534dec2f34eb0a07622c044e0f00909f949cc2415f98438',
//   },
//   {
//     name: 'EURT / USD',
//     oracleDecimals: 8,
//     aggregator: '0x920E5DC12E7500c6571C63D4Bba19c62e99d6883',
//     chainLinkFeed: '0x01D391A48f4F7339aC64CA2c83a07C22F95F587a',
//     oraclePrice: 1.10205749,
//     slotIndex: 44,
//     slotData:
//       '0x0000000064c8450a000000000000000000000000000000000000000006919b35',
//     key: '0xf4553b4bf021f3ec003e91a250809b8b75c4d4b479b5cc7038d5f2215ba5b5b8',
//   },
//   {
//     name: 'EUR / USD',
//     oracleDecimals: 8,
//     aggregator: '0x02F878A94a1AE1B15705aCD65b5519A46fe3517e',
//     chainLinkFeed: '0xb49f677943BC038e9857d61E7d053CaA2C1734C1',
//     oraclePrice: 1.0894,
//     slotIndex: 43,
//     slotData:
//       '0x0000000064c8450f0000000000000000000000000000000000000000067e4ae0',
//     key: '0x0c048b00f7187ad900a3c23b51c2f4344f90c29fadaf773f054653a6a02efdec',
//   },
//   {
//     name: 'STETH / ETH',
//     oracleDecimals: 18,
//     aggregator: '0x716BB759A5f6faCdfF91F0AfB613133d510e1573',
//     chainLinkFeed: '0x86392dc19c0b719886221c78ab11eb8cf5c52812',
//     oraclePrice: 1,
//     slotIndex: 44,
//     slotData:
//       '0x0000000064c84514000000000000000000000000000000000de0b6b3a7640000',
//     key: '0xa538a1b77ee33d21e93b98fb5960b3be245530ad480d4c4bbf68e35f0af3fb8f',
//   },
//   {
//     name: 'STETH / USD',
//     oracleDecimals: 8,
//     aggregator: '0xdA31bc2B08F22AE24aeD5F6EB1E71E96867BA196',
//     chainLinkFeed: '0xCfE54B5cD566aB89272946F602D76Ea879CAb4a8',
//     oraclePrice: 1870,
//     slotIndex: 44,
//     slotData:
//       '0x0000000064c84519000000000000000000000000000000000000002b8a118e00',
//     key: '0xd7771a7184b4243512ed277181b9c07a6494dbcb61d8c7153d8f7ee010128178',
//   },
//   {
//     name: 'RETH / ETH',
//     oracleDecimals: 18,
//     aggregator: '0x9cB248E68fb81d0CFE7D6B3265Fe6Bf123A71FE0',
//     chainLinkFeed: '0x536218f9E9Eb48863970252233c8F271f554C2d0',
//     oraclePrice: 1.0752,
//     slotIndex: 44,
//     slotData:
//       '0x0000000064c8451e000000000000000000000000000000000eebe0b40e7fffbe',
//     key: '0xe134c21e65604cc588742397f8b3b603c76d6f49f7a7d0df4049f921337f46f5',
//   },
//   {
//     name: 'CBETH / ETH',
//     oracleDecimals: 18,
//     aggregator: '0xd74FF3f1b565597E59D44320F53a5C5c8BA85f7b',
//     chainLinkFeed: '0xf017fcb346a1885194689ba23eff2fe6fa5c483b',
//     oraclePrice: 1.0393603625417713,
//     slotIndex: 44,
//     slotData:
//       '0x0000000064c84523000000000000000000000000000000000e6c8cbe32ec6a44',
//     key: '0xd1dbe8f9b2ac37656a807c503c5392c2b60de64eb62146c701bebdda6ea926f1',
//   },
//   {
//     name: 'WBTC / BTC',
//     oracleDecimals: 8,
//     aggregator: '0xD7623f1d24b35c392862fB67C9716564A117C9DE',
//     chainLinkFeed: '0xfdFD9C85aD200c506Cf9e21F1FD8dd01932FBB23',
//     oraclePrice: 0.998955,
//     slotIndex: 44,
//     slotData:
//       '0x0000000064c84528000000000000000000000000000000000000000005f448cc',
//     key: '0x11fc446a52dbbbe30f22ebcfc43d64562c0929c90acbe70e5725f7bfb91892f0',
//   },
// ]

const UpdateOracles = () => {
  // const client = usePublicClient()
  // const chainId = useAtomValue(chainIdAtom)

  // const makeOraclesRecent = async () => {
  //   try {
  //     await Promise.all(
  //       oracles.map(async (oracle) =>
  //         client.request({
  //           method: 'tenderly_setStorageAt' as any,
  //           params: [oracle.aggregator, oracle.key, oracle.slotData] as any,
  //         })
  //       )
  //     )
  //     console.log('Oracles updated!')
  //   } catch (e) {
  //     console.error('Error updating oracles', e)
  //   }
  // }

  // useEffect(() => {
  //   // Only support mainnet fork for now
  //   if (client && chainId === ChainId.Mainnet) makeOraclesRecent()
  // }, [client])

  return null
}

export default UpdateOracles
