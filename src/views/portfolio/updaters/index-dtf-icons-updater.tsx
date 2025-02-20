import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { indexDTFIconsAtom } from '../atoms'

const IndexDTFIconsUpdater = () => {
  const setIcons = useSetAtom(indexDTFIconsAtom)

  const { data } = useQuery({
    queryKey: ['icons'],
    queryFn: async () => {
      const res = await fetch(RESERVE_API + 'dtf/icons')
      return res.json()
    },
  })

  useEffect(() => {
    if (data) {
      setIcons(data)
    }
  }, [data])

  return null
}

export default IndexDTFIconsUpdater
