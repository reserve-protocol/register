import { useEffect, useState } from 'react'

const useLoadingAfterRefetch = (data: any) => {
  const [loadingAfterRefetch, setLoadingAfterRefetch] = useState(false)

  useEffect(() => {
    let loadingTimeout: NodeJS.Timeout | undefined

    if (data) {
      setLoadingAfterRefetch(true)
      loadingTimeout = setTimeout(() => {
        setLoadingAfterRefetch(false)
      }, 500)
    } else {
      clearTimeout(loadingTimeout)
      setLoadingAfterRefetch(false)
    }

    return () => {
      clearTimeout(loadingTimeout)
    }
  }, [data])

  return {
    loadingAfterRefetch,
  }
}

export default useLoadingAfterRefetch
