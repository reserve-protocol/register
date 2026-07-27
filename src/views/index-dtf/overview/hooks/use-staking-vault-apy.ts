import { indexDTFAtom } from '@/state/dtf/atoms'
import { RESERVE_API } from '@/utils/constants'
import useVoteLockPositions, {
  VoteLockPosition,
} from '@/views/earn/views/index-dtf/hooks/use-vote-lock-positions'
import { indexDtfs } from '@reserve-protocol/dtf-catalog'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

// Catalog entries are keyed with mixed-case addresses — normalize once.
const activeCatalogByChain: Record<number, Set<string>> = {}
for (const [chainId, entries] of Object.entries(indexDtfs)) {
  activeCatalogByChain[Number(chainId)] = new Set(
    Object.values(entries)
      .filter((dtf) => dtf.status === 'active')
      .map((dtf) => dtf.address.toLowerCase())
  )
}

const isActiveCatalogDTF = (address: string, chainId: number) =>
  !!activeCatalogByChain[chainId]?.has(address.toLowerCase())

// The DAO (and its APR) belongs to the vote-lock token, not the DTF — one
// stToken governs many DTFs. Listed DTFs read the same /dtf/daos list the
// earn page uses so every surface shares one cached number; unlisted DTFs
// (or a list that can't answer) keep the per-DTF endpoint — it stays keyed
// by DTF address because sdk getVoteLockDao resolves DAOs that way — and
// accept its per-URL cache split.
export const useVoteLockDAO = (): VoteLockPosition | undefined => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = indexDTF?.chainId
  const stTokenAddress = indexDTF?.stToken?.id.toLowerCase()
  const isListed =
    !!indexDTF && isActiveCatalogDTF(indexDTF.id, indexDTF.chainId)

  const listQuery = useVoteLockPositions({
    enabled: isListed && !!stTokenAddress,
  })
  const listedDao = listQuery.data?.find(
    (position) =>
      position.chainId === chainId &&
      position.token.address.toLowerCase() === stTokenAddress
  )

  // Detail fallback: no answer in the shared list — the DTF is unlisted, or
  // the list settled (success/error) without this DAO. A cached list hit
  // counts as an answer even for unlisted DTFs; it's the same DAO row.
  const listSettled = listQuery.isError || listQuery.isSuccess
  const needsDetail =
    !!stTokenAddress && !listedDao && (!isListed || listSettled)
  const daoQuery = useQuery({
    queryKey: ['vote-lock-dao', indexDTF?.id, chainId],
    queryFn: async () => {
      const daoData = await fetch(
        `${RESERVE_API}dtf/daos/${indexDTF?.id}?chainId=${chainId}`
      )
      if (!daoData.ok) {
        throw new Error('Failed to fetch DTF dao')
      }
      const data = await daoData.json()
      return data as VoteLockPosition
    },
    enabled: needsDetail,
  })

  return listedDao ?? daoQuery.data
}

export const useVoteLockAPR = (): number | undefined => {
  return useVoteLockDAO()?.apr
}
