import dayjs from 'dayjs'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { blockTimestampAtom } from 'state/atoms'
import { TIME_RANGES, TIME_RANGE_VALUE } from 'utils/constants'

const useTimeFrom = (range = TIME_RANGES.DAY): number => {
  const timestamp = useAtomValue(blockTimestampAtom)

  return useMemo(() => {
    return (timestamp || dayjs().unix()) - TIME_RANGE_VALUE[range] || 0
  }, [!!timestamp, range])
}

export default useTimeFrom
