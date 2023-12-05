import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

const useSwitchChain = () => {
  const search = useSearchParams()

  return useCallback(
    (chain: number) => {
      const [searchParams, setSearchParams] = search

      if (chain !== Number(searchParams.get('chainId') || 0)) {
        searchParams.set('chainId', chain.toString())
        setSearchParams(searchParams, { replace: true })
      }
    },
    [search]
  )
}

export default useSwitchChain
