import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

const RESERVE_API = 'https://api.reserve.org/'
const REFRESH_INTERVAL = 1000 * 60 * 10 // 10 minutes

// Hardcoded snapshot of deprecated DTFs for instant lookup before API loads
const KNOWN_DEPRECATED: { address: string; chainId: number }[] = [
  { address: '0x005f893ecd7bf9667195642f7649da8163e23658', chainId: 1 },
  { address: '0xacdf0dba4b9839b96221a8487e9ca660a48212be', chainId: 1 },
  { address: '0x78da5799cf427fee11e9996982f4150ece7a99a7', chainId: 1 },
  { address: '0xfc0b1eef20e4c68b3dcf36c4537cfa7ce46ca70b', chainId: 1 },
  { address: '0xcc7ff230365bd730ee4b352cc2492cedac49383e', chainId: 8453 },
  { address: '0x641b0453487c9d14c5df96d45a481ef1dc84e31f', chainId: 8453 },
  { address: '0x47686106181b3cefe4eaf94c4c10b48ac750370b', chainId: 8453 },
  { address: '0xfe45eda533e97198d9f3deeda9ae6c147141f6f9', chainId: 8453 },
  { address: '0xf8ef6e785473e82527908b06023ac3e401ccfdcd', chainId: 8453 },
  { address: '0xd600e748c17ca237fcb5967fa13d688aff17be78', chainId: 8453 },
  { address: '0x8f0987ddb485219c767770e2080e5cc01ddc772a', chainId: 8453 },
  { address: '0xc9a3e2b3064c1c0546d3d0edc0a748e9f93cf18d', chainId: 8453 },
  { address: '0x89ff8f639d402839205a6bf03cc01bdffa4768b7', chainId: 8453 },
  { address: '0x0bbf664d46becc28593368c97236faa0fb397595', chainId: 42161 },
]

const KNOWN_DEPRECATED_ADDRESSES = new Set(
  KNOWN_DEPRECATED.map((d) => d.address)
)

export type DTFStatus = 'active' | 'deprecated' | 'unsupported'

type DTFStatusItem = {
  address: string
  chainId: number
  status: DTFStatus
}

// WHY: deprecated and unsupported are treated the same in UI for now
export const isInactiveDTF = (status: DTFStatus) =>
  status === 'deprecated' || status === 'unsupported'

const useDiscoverDTFs = () => {
  return useQuery({
    queryKey: ['discover-dtfs-status'],
    queryFn: async (): Promise<DTFStatusItem[]> => {
      const response = await fetch(`${RESERVE_API}discover/dtfs`)
      if (!response.ok) throw new Error('Failed to fetch dtf list')
      const data = await response.json()
      return data.map((item: any) => ({
        address: item.address?.toLowerCase(),
        chainId: item.chainId,
        status: item.status ?? 'active',
      }))
    },
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  })
}

const isKnownDeprecated = (address: string, chainId?: number): boolean => {
  const lower = address.toLowerCase()
  return KNOWN_DEPRECATED.some(
    (d) => d.address === lower && d.chainId === chainId
  )
}

export const useDTFStatus = (
  address?: string,
  chainId?: number
): DTFStatus => {
  const { data } = useDiscoverDTFs()

  if (!address) return 'active'

  // Fast path: check hardcoded list before API loads
  if (!data) {
    return isKnownDeprecated(address, chainId) ? 'deprecated' : 'active'
  }

  const match = data.find(
    (item) =>
      item.address === address.toLowerCase() && item.chainId === chainId
  )

  return match?.status ?? 'active'
}

export const useDeprecatedAddresses = (): Set<string> => {
  const { data } = useDiscoverDTFs()

  return useMemo(() => {
    if (!data) return KNOWN_DEPRECATED_ADDRESSES

    const inactive = new Set<string>()
    for (const item of data) {
      if (isInactiveDTF(item.status)) {
        inactive.add(item.address)
      }
    }
    return inactive
  }, [data])
}
