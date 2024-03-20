import Chainlink from 'abis/Chainlink'
import { useMemo } from 'react'
import { ChainId } from 'utils/chains'
import collateralPlugins from 'utils/plugins'
import { formatUnits } from 'viem'
import { Address, useContractRead } from 'wagmi'

const WSTETH_ADDRESS = '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452'
const CHAINLINK_ETH_FEED = '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70'

const CHAINLINK_FEED: Record<number, Record<string, Address>> = {
  [ChainId.Mainnet]: {
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48':
      '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6', // USDC / USD
    '0xdAC17F958D2ee523a2206206994597C13D831ec7':
      '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D', // USDT / USD
    '0x6B175474E89094C44Da98b954EedeAC495271d0F':
      '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9', // DAI / USD
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599':
      '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c', // WBTC / USD
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2':
      '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419', // WETH / USD
    '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE':
      '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419', // ETH / USD
    '0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3':
      '0x7A364e8770418566e3eb2001A96116E6138Eb32F', // MIM / USD
    '0x853d955aCEf822Db058eb8505911ED77F175b99e':
      '0xB9E1E3A9feFf48998E45Fa90847ed4D467E8BcfD', // FRAX / USD
  },
  [ChainId.Base]: {
    '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA':
      '0x7e860098F58bBFC8648a4311b374B1D669a2bc6B', // USDbC / USD
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913':
      '0x7e860098F58bBFC8648a4311b374B1D669a2bc6B', // USDbC / USD
    '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb':
      '0x591e79239a7d679378eC8c847e5038150364C78F', // DAI / USD
    '0x4200000000000000000000000000000000000006':
      CHAINLINK_ETH_FEED, // WETH / USD
    '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22':
      '0xd7818272B9e248357d13057AAb0B417aF31E817d', // cbETH / USD
    '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE':
      CHAINLINK_ETH_FEED, // ETH / USD
    [WSTETH_ADDRESS]:
      '0xa669E5272E60f78299F4824495cE01a3923f4380', // wstETH / ETH
  },
}

export const useChainlinkPrice = (chainId: number, tokenAddress?: Address) => {
  const plugins = collateralPlugins[chainId]

  const chainlinkAddress =
    CHAINLINK_FEED[chainId]?.[tokenAddress?.toString() || ''] ||
    plugins?.find((plugin) => plugin.erc20 === tokenAddress?.toString())
      ?.chainlinkFeed

  const { data } = useContractRead({
    enabled: !!chainlinkAddress,
    abi: Chainlink,
    address: chainlinkAddress,
    functionName: 'latestRoundData',
    chainId,
  })

  const { data: ethData } = useContractRead({
    enabled: tokenAddress?.toString() === WSTETH_ADDRESS,
    abi: Chainlink,
    address: CHAINLINK_ETH_FEED,
    functionName: 'latestRoundData',
    chainId,
  })

  return useMemo(() => {
    if (!data) return undefined

    if (tokenAddress?.toString() === WSTETH_ADDRESS) {
      if (!ethData) return undefined
      return +formatUnits(ethData[1], 8) * +formatUnits(data[1], 18)
    }

    return +formatUnits(data[1], 8)
  }, [data])
}
