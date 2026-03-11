import rtokens from '@reserve-protocol/rtokens'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { ChainId } from '@/utils/chains'
import { Address } from 'viem'
import { listedYieldDTFsAtom, ListedYieldDTF } from './atoms'

const CHAINS = [ChainId.Mainnet, ChainId.Base, ChainId.Arbitrum] as const

const Updater = () => {
  const setListedYieldDTFs = useSetAtom(listedYieldDTFsAtom)

  useEffect(() => {
    const list: ListedYieldDTF[] = []

    for (const chainId of CHAINS) {
      const tokens = rtokens[chainId] ?? {}
      for (const token of Object.values(tokens)) {
        list.push({
          id: token.address as Address,
          name: token.name,
          symbol: token.symbol,
          chainId,
          logo: token.logo,
        })
      }
    }

    setListedYieldDTFs(list)
  }, [setListedYieldDTFs])

  return null
}

export default Updater
