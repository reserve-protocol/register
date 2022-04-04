import { useWeb3React, Web3ReactProvider } from '@web3-react/core'
import connectors from 'components/wallets/connectors'
import { Multicall } from 'ethereum-multicall'
import { BlockUpdater } from 'hooks/useBlockNumber'
import { atom, useAtomValue, useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import React, { useEffect } from 'react'

export const multicallAtom = atom<Multicall | null>(null)

export const callsAtom = atom([])
export const mappedCalls = atom((get) => get(callsAtom))

const MulticallProvider = () => {
  const { provider } = useWeb3React()
  const [client, setClient] = useAtom(multicallAtom)
  const calls = useAtomValue(callsAtom)
  const filteredCalls = useAtomValue(mappedCalls)

  useEffect(() => {
    if (provider) {
      setClient(new Multicall({ ethersProvider: provider }))
    }
  }, [provider])

  useEffect(() => {}, [JSON.stringify(filteredCalls), client])

  return null
}

/**
 * Wrapper around web3ReactProvider
 * Handles basic logic as well as adds related chain providers
 */
const Web3Provider = ({ children }: { children: React.ReactNode }) => (
  <Web3ReactProvider connectors={connectors}>
    <MulticallProvider />
    <BlockUpdater />
    {children}
  </Web3ReactProvider>
)

export default Web3Provider
