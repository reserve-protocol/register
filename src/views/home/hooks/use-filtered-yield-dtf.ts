import { isInactiveDTF, useDeprecatedAddresses } from '@/hooks/use-dtf-status'
import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import useTokenList, { ListedToken } from '@/hooks/useTokenList'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainFilterAtom, searchFilterAtom } from '../atoms'

const STABLECOINS = ['eUSD', 'rgUSD']

const useFilteredYieldDTF = ({
  stablecoins = false,
}: {
  stablecoins?: boolean
}) => {
  const { list: data, isLoading } = useTokenList()
  const search = useAtomValue(searchFilterAtom)
  const chains = useAtomValue(chainFilterAtom)
  const deprecatedAddresses = useDeprecatedAddresses()

  return useMemo(() => {
    if (!data) {
      return { data: [] as ListedToken[], isLoading }
    }

    const filtered = data.filter((dtf) => {
      const isDeprecated = deprecatedAddresses.has(dtf.id.toLowerCase())

      if (!search && isDeprecated) {
        return false
      }

      if (!chains.length || !chains.includes(dtf.chain)) {
        return false
      }

      if (search) {
        const searchLower = search.toLowerCase()
        const nameMatch = dtf.name.toLowerCase().includes(searchLower)
        const symbolMatch = dtf.symbol.toLowerCase().includes(searchLower)
        const collateralMatch = dtf.collaterals?.some((collateral) =>
          collateral.symbol.toLowerCase().includes(searchLower)
        )

        if (!nameMatch && !symbolMatch && !collateralMatch) {
          return false
        }
      }

      // const isStablecoin = STABLECOINS.includes(dtf.symbol)

      // if ((stablecoins && !isStablecoin) || (!stablecoins && isStablecoin)) {
      //   return false
      // }

      return true
    })

    return { data: filtered, isLoading }
  }, [data, search, chains, isLoading])
}

export default useFilteredYieldDTF
