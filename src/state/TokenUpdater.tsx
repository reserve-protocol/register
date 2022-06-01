import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { MainInterface } from 'abis'
import { Main } from 'abis/types'
import { useRTokenContract } from 'hooks/useContract'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect } from 'react'
import { getContract } from 'utils'
import { selectedRTokenAtom } from './atoms'
import tokenMap from 'rtokens'

// Try to grab the token meta from theGraph
// If it fails, get it from the blockchain (only whitelisted tokens)
const TokenUpdater = () => {
  const tokenAddress = useAtomValue(selectedRTokenAtom)

  const getTokenMeta = useCallback(async () => {
    if (!tokenMap[tokenAddress]) {
    }
  }, [tokenAddress])

  useEffect(() => {
    getTokenMeta()
  }, [getTokenMeta])

  return null
}

export default TokenUpdater
