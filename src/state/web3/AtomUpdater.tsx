import '@rainbow-me/rainbowkit/styles.css'
import { useEffect } from 'react'

import {
  useAccount,
  useBlockNumber,
  useNetwork,
  usePublicClient,
  useWalletClient,
} from 'wagmi'
import { useSetAtom } from 'jotai'
import {
  blockAtom,
  chainIdAtom,
  publicClientAtom,
  walletAtom,
  walletClientAtom,
} from 'state/atoms'

// Keep web3 state in sync with atoms
const AtomUpdater = () => {
  const { address: account } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const { chain } = useNetwork()
  // Setters
  const setWallet = useSetAtom(walletAtom)
  const setWalletClient = useSetAtom(walletClientAtom)
  const setPublicClient = useSetAtom(publicClientAtom)
  const setBlockNumber = useSetAtom(blockAtom)
  const setChain = useSetAtom(chainIdAtom)

  useEffect(() => {
    setWallet(account ?? '')
  }, [account])

  useEffect(() => {
    setWalletClient(walletClient ? walletClient : undefined)
  }, [walletClient])

  useEffect(() => {
    setPublicClient(publicClient ? publicClient : undefined)
  }, [publicClient])

  useEffect(() => {
    setBlockNumber(blockNumber ? Number(blockNumber) : undefined)
  }, [blockNumber])

  useEffect(() => {
    if (chain && !chain.unsupported) {
      setChain(chain.id)
    }
  }, [chain])

  return null
}

export default AtomUpdater
