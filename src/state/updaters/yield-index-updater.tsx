import { indexDTFAtom, indexDTFExposureDataAtom } from '@/state/dtf/atoms'
import {
  COLLATERAL_POOL_MAP,
  indexDTFApyAtom,
  indexDTFPoolsDataAtom,
  indexDTFUnderlyingNamesAtom,
  isYieldIndexDTFAtom,
} from '@/state/dtf/yield-index-atoms'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { Address, erc20Abi } from 'viem'
import { useReadContracts } from 'wagmi'

const underlyingAddressesAtom = atom<string[]>((get) => {
  const pools = get(indexDTFPoolsDataAtom)
  if (!pools) return []
  const seen = new Set<string>()
  return pools
    .flatMap((p) => p.underlyingTokens ?? [])
    .filter((addr) => {
      const key = addr.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
})

const IndexDTFApyUpdater = ({ chainId }: { chainId: number }) => {
  const dtf = useAtomValue(indexDTFAtom)
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)
  const setApyData = useSetAtom(indexDTFApyAtom)

  const { data: apyData } = useQuery({
    queryKey: ['dtf-apy', dtf?.id, chainId],
    queryFn: async () => {
      if (!dtf?.id) return null

      const response = await fetch(
        `${RESERVE_API}v1/dtf/apy/${dtf.id}?chainId=${chainId}`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch APY data: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: !!dtf?.id && !!chainId && isYieldIndexDTF,
    refetchInterval: 60000,
  })

  useEffect(() => {
    if (apyData) {
      setApyData(apyData)
    }
  }, [apyData, setApyData])

  return null
}

const IndexDTFPoolsUpdater = ({ chainId }: { chainId: number }) => {
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)
  const exposureData = useAtomValue(indexDTFExposureDataAtom)
  const setPoolsData = useSetAtom(indexDTFPoolsDataAtom)
  const setUnderlyingNames = useSetAtom(indexDTFUnderlyingNamesAtom)

  const poolIds =
    exposureData
      ?.flatMap((group) => group.tokens)
      .map((t) => COLLATERAL_POOL_MAP[t.address.toLowerCase()])
      .filter(Boolean) ?? []

  const { data: poolsData } = useQuery({
    queryKey: ['dtf-pools', ...poolIds],
    queryFn: async () => {
      const results = await Promise.all(
        poolIds.map(async (poolId) => {
          const response = await fetch(
            `https://yields.llama.fi/poolsEnriched?pool=${poolId}`
          )
          if (!response.ok) return null
          const json = await response.json()
          return json.data?.[0] ?? null
        })
      )
      return results.filter(Boolean)
    },
    enabled: isYieldIndexDTF && poolIds.length > 0,
    staleTime: 3600000,
  })

  useEffect(() => {
    if (poolsData) {
      setPoolsData(poolsData)
    }
  }, [poolsData, setPoolsData])

  // Fetch name/symbol for unique underlying tokens via multicall
  const underlyingAddresses = useAtomValue(underlyingAddressesAtom)

  const erc20Calls = useMemo(
    () =>
      underlyingAddresses.flatMap((addr) => [
        {
          address: addr as Address,
          abi: erc20Abi,
          functionName: 'name' as const,
          chainId,
        },
        {
          address: addr as Address,
          abi: erc20Abi,
          functionName: 'symbol' as const,
          chainId,
        },
      ]),
    [underlyingAddresses, chainId]
  )

  const { data: nameResults } = useReadContracts({
    contracts: erc20Calls,
    allowFailure: true,
    query: {
      enabled: underlyingAddresses.length > 0,
      staleTime: Infinity,
    },
  })

  useEffect(() => {
    if (!nameResults || !underlyingAddresses.length) return
    const names: Record<string, { name: string; symbol: string }> = {}
    for (let i = 0; i < underlyingAddresses.length; i++) {
      const nameResult = nameResults[i * 2]
      const symbolResult = nameResults[i * 2 + 1]
      names[underlyingAddresses[i].toLowerCase()] = {
        name: (nameResult?.result as string) || '',
        symbol: (symbolResult?.result as string) || '',
      }
    }
    setUnderlyingNames(names)
  }, [nameResults, underlyingAddresses, setUnderlyingNames])

  return null
}

const YieldIndexUpdater = ({ chainId }: { chainId: number }) => (
  <>
    <IndexDTFApyUpdater chainId={chainId} />
    <IndexDTFPoolsUpdater chainId={chainId} />
  </>
)

export default YieldIndexUpdater
