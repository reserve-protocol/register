import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { collateralYieldAtom } from 'state/atoms'
import useSWR from 'swr'
import { StringMap } from 'types'

const poolsMap: StringMap = {
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
  '8a20c472-142c-4442-b724-40f2183c073e': 'stkcvxmim-3lp3crv-f',
  'ad3d7253-fb8f-402f-a6f8-821bc0a055cb': 'stkcvxcrv3crypto',
  '7394f1bc-840a-4ff0-9e87-5e0ef932943a': 'stkcvx3crv',
  'c04005c9-7e34-41a6-91c4-295834ed8ac0': 'stkcvxeusd3crv-f',
}

const CollateralYieldUpdater = () => {
  const [collateralYield, setCollateralYield] = useAtom(collateralYieldAtom)
  const { data } = useSWR('https://yields.llama.fi/pools', (...args) =>
    fetch(...args).then((res) => res.json())
  )

  useEffect(() => {
    if (data?.data) {
      const poolYield: { [x: string]: number } = {}

      for (const pool of data.data) {
        if (poolsMap[pool.pool]) {
          poolYield[poolsMap[pool.pool]] = pool.apyMean30d || 0
        }
      }

      setCollateralYield({
        ...collateralYield,
        ...poolYield,
      })
    }
  }, [data])

  return null
}

export default CollateralYieldUpdater
