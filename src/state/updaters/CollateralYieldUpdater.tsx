import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { CollateralYieldByChain, collateralYieldAtom } from 'state/atoms'
import useSWRImmutable from 'swr/immutable'
import { ChainId } from 'utils/chains'
import { supportedChainList } from 'utils/constants'

const chainIds: Record<string, number> = {
  Ethereum: 1,
  Base: 8453,
  Arbitrum: 42161,
}

const poolsMap: Record<number, Record<string, string>> = {
  [ChainId.Mainnet]: {
    'acee1e4d-a73c-4e20-98f7-e87c13d446e4': 'apxeth',
    '405d8dad-5c99-4c91-90d3-82813ade1ff1': 'sadai',
    'a349fea4-d780-4e16-973e-70ca9b606db2': 'sausdc',
    '60d657c9-5f63-4771-a85b-2cf8d507ec00': 'sausdt',
    '1d53fa29-b918-4d74-9508-8fcf8173ca51': 'sausdp',
    'cc110152-36c2-4e10-9c12-c5b4eb662143': 'cdai',
    'cefa9bb8-c230-459a-a855-3b94e96acd8c': 'cusdc',
    '57647093-2868-4e65-97ab-9cae8ec74e7d': 'cusdt',
    '6c2b7a5c-6c4f-49ea-a08c-0366b772f2c2': 'cusdp',
    '1d876729-4445-4623-8b6b-c5290db5d100': 'cwbtc',
    '1e5da7c6-59bb-49bd-9f97-4f4fceeffad4': 'ceth',
    'fa4d7ee4-0001-4133-9e8d-cf7d5d194a91': 'fusdc',
    'ed227286-abb0-4a34-ada5-39f7ebd81afb': 'fdai',
    '6600934f-6323-447d-8a7d-67fbede8529d': 'fusdt',
    '747c1d2a-c668-4682-b9f9-296708a3dd90': 'wsteth',
    'd4b3c522-6127-4b89-bedf-83641cdcd2eb': 'reth',
    '7da72d09-56ca-4ec5-a45f-59114353e487': 'wcusdcv3',
    'f4d5b566-e815-4ca2-bb07-7bcd8bc797f1': 'wcusdtv3',
    '8a20c472-142c-4442-b724-40f2183c073e': 'stkcvxmim-3lp3crv-f',
    'ad3d7253-fb8f-402f-a6f8-821bc0a055cb': 'stkcvxcrv3crypto',
    '7394f1bc-840a-4ff0-9e87-5e0ef932943a': 'stkcvx3crv',
    'c04005c9-7e34-41a6-91c4-295834ed8ac0': 'stkcvxeusd3crv-f',
    '325ad2d6-70b1-48d7-a557-c2c99a036f87': 'mrp-ausdc',
    '1343a280-7812-4bc3-8f98-d1c37e11d271': 'mrp-ausdt',
    'b8bcdf8e-96ed-40ca-a7aa-aa048b9874e5': 'mrp-adai',
    '7be52986-18c2-450f-b74b-d65fb1205bbf': 'mrp-aweth',
    'ff61171d-d7b0-4989-816c-b9bf02a15f00': 'mrp-awbtc',
    'eab8d63d-8a8f-48cb-8027-583508831d24': 'mrp-asteth',
    '0f45d730-b279-4629-8e11-ccb5cc3038b4': 'cbeth',
    'c8a24fee-ec00-4f38-86c0-9f6daebc4225': 'sdai',
    '55de30c3-bf9f-4d4e-9e0b-536a8ef5ab35': 'sfrax',
    'aa70268e-4b52-42bf-a116-608b370f9501': 'saethusdc',
    'd118f505-e75f-4152-bad3-49a2dc7482bf': 'saethpyusd',
    '01146cce-9140-4e03-9a2e-82c99ccc42f1': 'stkcvxpyusdusdc',
    '77020688-e1f9-443c-9388-e51ace15cc32': 'sfrxeth',
    'bf3815bb-1059-4f24-90a3-14998e8493fa': 're7weth',
    'a3ffd3fe-b21c-44eb-94d5-22c80057a600': 'stkcvxcrvusdusdt-f',
    '755fcec6-f4fd-4150-9184-60f099206694': 'stkcvxcrvusdusdc-f',
    'd1dacce1-7815-420c-bb6d-d3c4320e1b2a': 'steakpyusd',
    '043a8330-bc29-4164-aa1c-28de7bf87755': 'bbusdt',
    'a44febf3-34f6-4cd5-8ab1-f246ebe49f9e': 'steakusdc',
    '74346f6f-c7ee-4506-a204-baf48e13decb': 'stkcvxeth+eth-f',
    '66985a81-9c51-46ca-9977-42b4fe7bc6df': 'susde',
    '90bfb3c2-5d35-4959-a275-ba5085b08aa3': 'ethx',
  },
  [ChainId.Base]: {
    'df65c4f4-e33a-481c-bac8-0c2252867c93': 'wcusdbcv3',
    '0c8567f8-ba5b-41ad-80de-00a71895eb19': 'wcusdcv3',
    '9d09b0be-f6c2-463a-ad2c-4552b3e12bd9': 'wsgusdbc',
    '7e0661bf-8cf3-45e6-9424-31916d4c7b84': 'sabasusdc',
    '833ec61b-f9e6-46ac-9eff-2785808b2389': 'sabasusdbc',
  },
  [ChainId.Arbitrum]: {
    'd9c395b9-00d0-4426-a6b3-572a6dd68e54': 'wcusdcv3',
    '85247b13-8180-44e7-b38c-4d324cc68a92': 'wcusdtv3',
    'd9fa8e14-0447-4207-9ae8-7810199dfa1f': 'saarbusdcn',
    '3a6cc030-738d-4e19-8a40-e63e9c4d5a6f': 'saarbusdt',
  },
}

export const symbolMap: Record<string, Record<number, string>> = Object.entries(
  poolsMap
)
  .flatMap(([chainId, pools]) =>
    Object.entries(pools).map(([poolId, symbol]) => ({
      chainId,
      symbol,
      poolId,
    }))
  )
  .reduce(
    (acc, { chainId, symbol, poolId }) => ({
      ...acc,
      [symbol]: {
        ...acc[symbol],
        [chainId]: poolId,
      },
    }),
    {} as Record<string, Record<number, string>>
  )

const CollateralYieldUpdater = () => {
  const [collateralYield, setCollateralYield] = useAtom(collateralYieldAtom)
  const { data } = useSWRImmutable('https://yields.llama.fi/pools', (...args) =>
    fetch(...args).then((res) => res.json())
  )
  useEffect(() => {
    if (data?.data) {
      const yields: CollateralYieldByChain = {
        [ChainId.Mainnet]: {},
        [ChainId.Base]: {},
        [ChainId.Arbitrum]: {
          wusdm: 5, // TODO: hardcoded
        },
      }

      for (const pool of data.data) {
        const chainId = chainIds[pool.chain as string]
        const poolId = poolsMap[chainId]?.[pool.pool]

        if (poolId) {
          yields[chainId][poolId] = pool.apyMean30d || 0

          // Add vault yields for cUSDC and cUSDT
          if (poolId === 'cusdc' || poolId === 'cusdt') {
            yields[chainId][`${poolId}-vault`] = yields[chainId][poolId]
          }

          // Add wstETH and cbETH yields to all chains
          if (poolId === 'wsteth' || poolId === 'cbeth') {
            supportedChainList.forEach(
              (_chainId) => (yields[_chainId][poolId] = yields[chainId][poolId])
            )
          }
        }
      }

      setCollateralYield({
        ...collateralYield,
        ...yields,
      })
    }
  }, [data])

  return null
}

export default CollateralYieldUpdater
