import '@rainbow-me/rainbowkit/styles.css'
import { useEffect } from 'react'

import { useAtom, useSetAtom } from 'jotai'
import {
  blockAtom,
  blockTimestampAtom,
  chainIdAtom,
  publicClientAtom,
  walletAtom,
  walletClientAtom,
} from 'state/atoms'
import {
  useAccount,
  useBlockNumber,
  useNetwork,
  usePublicClient,
  useWalletClient,
} from 'wagmi'
import { publicClient, wagmiConfig } from '..'

// Keep web3 state in sync with atoms
const AtomUpdater = () => {
  const { address: account } = useAccount()
  const { data: walletClient } = useWalletClient()
  const client = usePublicClient()
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const { chain } = useNetwork()
  // Setters
  const setWallet = useSetAtom(walletAtom)
  const setWalletClient = useSetAtom(walletClientAtom)
  const setPublicClient = useSetAtom(publicClientAtom)
  const setBlockNumber = useSetAtom(blockAtom)
  const [chainId, setChain] = useAtom(chainIdAtom)
  const setBlockTimestamp = useSetAtom(blockTimestampAtom)

  const fetchTimestamp = async () => {
    try {
      if (client) {
        setBlockTimestamp(Number((await client.getBlock()).timestamp))
      }
    } catch (e) {
      console.error('error fetching block time', e)
    }
  }

  useEffect(() => {
    setWallet(account ?? null)
  }, [account])

  useEffect(() => {
    setWalletClient(walletClient ? walletClient : undefined)
  }, [walletClient])

  useEffect(() => {
    setPublicClient(client ? client : undefined)
  }, [client])

  useEffect(() => {
    fetchTimestamp() // update stored block timestamp
    setBlockNumber(blockNumber ? Number(blockNumber) : undefined)
  }, [blockNumber])

  useEffect(() => {
    // Chain id changed from wallet, react correctly
    if (chain && chain.id !== chainId && !chain.unsupported) {
      setChain(chain.id)
      wagmiConfig.setPublicClient(publicClient({ chainId: chain.id }))
    }
  }, [chain])

  return null
}

export default AtomUpdater
