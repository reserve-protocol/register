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

const facadeMock = {}

// Try to grab the token meta from theGraph
// If it fails, get it from the blockchain (only whitelisted tokens)
const TokenUpdater = () => {
  const selectedAddress = useAtomValue(selectedRTokenAtom)
  // TODO: Replace for real facade contract
  const facadeContract = facadeMock

  const getTokenMeta = useCallback(async (address: string) => {
    if (!tokenMap[tokenAddress]) {
    }
  }, [])

  useEffect(() => {
    getTokenMeta(selectedAddress)
  }, [selectedAddress, getTokenMeta])

  return null
}

export default TokenUpdater
