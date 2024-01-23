import { gql } from 'graphql-request'
import useQuery, { useCMSQuery } from 'hooks/useQuery'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { chainIdAtom, collateralYieldAtom } from 'state/atoms'
import useSWRImmutable from 'swr/immutable'
import { StringMap } from 'types'
import { ChainId } from 'utils/chains'

const rTokenCollateralQuery = gql`
  query {
    rTokenAssetDocumentationCollection {
      items {
        name
        id
        llamaId
      }
    }
  }
`

const CollateralYieldUpdater = () => {
  const [collateralYield, setCollateralYield] = useAtom(collateralYieldAtom)
  const { data } = useSWRImmutable('https://yields.llama.fi/pools', (...args) =>
    fetch(...args).then((res) => res.json())
  )

  const { data: rTokenCollateral } = useCMSQuery(rTokenCollateralQuery)

  useEffect(() => {
    if (
      data?.data &&
      rTokenCollateral?.rTokenAssetDocumentationCollection?.items
    ) {
      const idMap: { [x: string]: string } = {}
      for (const item of rTokenCollateral.rTokenAssetDocumentationCollection
        .items) {
        idMap[item.llamaId] = item.id
      }

      const poolYield: { [x: string]: number } = {}
      for (const pool of data.data) {
        if (idMap[pool.pool]) {
          poolYield[idMap[pool.pool]] = pool.apyMean30d || 0
        }
      }

      // TODO: Temporal until pool exists
      poolYield['sabasusdbc'] = 1.44

      setCollateralYield({
        ...collateralYield,
        ...poolYield,
      })
    }
  }, [data, rTokenCollateral])

  return null
}

export default CollateralYieldUpdater
