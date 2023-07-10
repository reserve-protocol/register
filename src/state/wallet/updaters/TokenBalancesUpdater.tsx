import { ethers, utils } from 'ethers'
import { Atom, Getter, WritableAtom, atom, useAtomValue } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { useEffect, useMemo } from 'react'
import { web3Atom } from '../../atoms'

// TODO: Redo token balance fetcher

export const useTokenBalance = (token: string) => {
  // const atom = useMemo(() => tokenBalancesStore.getBalanceAtom(token), [token])
  // return useAtomValue(atom)
}

export const useTokenBalances = (tokens: string[]) => {
  // const out = useMemo(() => {
  //   if (tokens.length === 0) {
  //     return atomZeroLen
  //   }
  //   return atom((get) =>
  //     tokens.map((t) =>
  //       // get(tokenBalancesStore.getBalanceAtom(utils.getAddress(t)))
  //     )
  //   )
  // }, [tokens.join()])
  // return useAtomValue(out)
  return []
}
export const TokenBalancesUpdater = () => {
  const { account, client } = useAtomValue(web3Atom)

  // useEffect(() => {
  //   if (account) {
  //     tokenBalancesStore.init(client, account)
  //   }

  //   return () => {
  //     tokenBalancesStore.deInit()
  //   }
  // }, [client, tokenBalancesStore])

  return null
}
