import '@rainbow-me/rainbowkit/styles.css'
import { useEffect } from 'react'

import { useAtom, useSetAtom } from 'jotai'
import {
  blockAtom,
  blockTimestampAtom,
  chainIdAtom,
  walletAtom,
} from 'state/atoms'
import { useAccount, useBlockNumber, useNetwork, usePublicClient } from 'wagmi'

// Keep web3 state in sync with atoms
const AtomUpdater = () => {
  const { address: account } = useAccount()
  const { chain } = useNetwork()
  // Setters
  const setWallet = useSetAtom(walletAtom)
  const setBlockNumber = useSetAtom(blockAtom)
  const [chainId, setChain] = useAtom(chainIdAtom)
  const { data: blockNumber } = useBlockNumber({ watch: true, chainId })
  const client = usePublicClient({ chainId })
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
    fetchTimestamp() // update stored block timestamp
    setBlockNumber(blockNumber ? Number(blockNumber) : undefined)
  }, [blockNumber])

  useEffect(() => {
    // Chain id changed from wallet, react correctly
    if (chain && chain.id !== chainId && !chain.unsupported) {
      setChain(chain.id)
    }
  }, [chain])

  return null
}

export default AtomUpdater
