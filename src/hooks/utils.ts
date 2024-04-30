import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { blockAtom } from 'state/atoms'

export const useBlockMemo = () => {
  const blockNumber = useAtomValue(blockAtom)

  return useMemo(() => blockNumber, [!!blockNumber])
}
