import { useEffect, useState } from 'react'

const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(() =>
    Math.floor(new Date().getTime() / 1000)
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(new Date().getTime() / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return currentTime
}

export default useCurrentTime
