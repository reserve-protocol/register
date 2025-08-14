import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { devModeAtom } from '../chain/atoms/chainAtoms'

const DevModeUpdater = () => {
  const [searchParams] = useSearchParams()
  const setDevMode = useSetAtom(devModeAtom)

  useEffect(() => {
    const debugParam = searchParams.get('debug')
    const isLocalhost = window.location.hostname === 'localhost'
    
    // Enable dev mode if debug=true in URL or if running on localhost
    setDevMode(debugParam === 'true' || isLocalhost)
  }, [searchParams, setDevMode])

  return null
}

export default DevModeUpdater
