import rtokens from '@lc-labs/rtokens'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { chainIdAtom, selectedRTokenAtom } from 'state/atoms'
import { isAddress } from 'utils'
import { NETWORKS } from 'utils/constants'
import { Address } from 'viem'

const getRTokenAddress = (tokenId?: string, network?: string) => {
  if (!tokenId || !network || !NETWORKS[network]) {
    return null
  }

  let rTokenAddress = isAddress(tokenId)

  // Look for listed tokens
  if (!rTokenAddress && rtokens[NETWORKS[network]]) {
    rTokenAddress = (Object.values(rtokens[NETWORKS[network]]).find(
      (rToken) => rToken.symbol.toLowerCase() === tokenId.toLowerCase()
    )?.address ?? null) as Address | null
  }

  return rTokenAddress
}

const useRTokenContext = () => {
  const navigate = useNavigate()
  const { chain, tokenId } = useParams()
  const setChain = useSetAtom(chainIdAtom)
  const setRToken = useSetAtom(selectedRTokenAtom)

  useEffect(() => {
    const rTokenAddress = getRTokenAddress(tokenId, chain)

    if (!rTokenAddress) {
      // TODO: Home or "wrong rtoken selected" route
      navigate('/')
    }
    setRToken(rTokenAddress)
    setChain(NETWORKS[chain as string])
  }, [chain, tokenId])

  // Cleanup RToken
  useEffect(() => {
    return () => {
      setRToken(null)
    }
  }, [])
}

export default useRTokenContext
