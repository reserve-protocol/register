import '@rainbow-me/rainbowkit/styles.css'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useEffect } from 'react'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  blockAtom,
  blockTimestampAtom,
  chainIdAtom,
  debouncedBlockAtom,
  timestampAtom,
  walletAtom,
  walletChainAtom,
} from 'state/atoms'
import { useAccount, useBlockNumber, usePublicClient } from 'wagmi'

// Keep web3 state in sync with atoms
const AtomUpdater = () => {
  const account = useAccount()

  // Setters
  const setWallet = useSetAtom(walletAtom)
  const setWalletChain = useSetAtom(walletChainAtom)
  const setBlockNumber = useSetAtom(blockAtom)
  const chainId = useAtomValue(chainIdAtom)
  const { data: blockNumber } = useBlockNumber({ watch: true, chainId })
  const client = usePublicClient({ chainId })
  const setBlockTimestamp = useSetAtom(blockTimestampAtom)
  const [timestamp, setTimestamp] = useAtom(timestampAtom)
  const [debouncedBlock, setDebouncedBlock] = useAtom(debouncedBlockAtom)

  const fetchTimestamp = async () => {
    try {
      if (client) {
        const blockTimestamp = Number((await client.getBlock()).timestamp)
        setBlockTimestamp(blockTimestamp)

        // TODO: set to a realistic value?
        // TODO: going to use this atom for all values that are updated live~
        if (blockTimestamp - timestamp > 50) {
          setTimestamp(blockTimestamp)
        }

        if (blockTimestamp - timestamp > 20) {
          setDebouncedBlock(Number(blockNumber))
        }
      }
    } catch (e) {
      console.error('error fetching block time', e)
    }
  }

  useEffect(() => {
    if (account && account.address) {
      setWallet(account.address)
      setWalletChain(account.chainId)
      mixpanel.register({
        wa: account.address,
      })
    } else {
      setWallet(null)
      setWalletChain(undefined)
    }
  }, [account?.address, account?.chainId])

  useEffect(() => {
    fetchTimestamp() // update stored block timestamp
    setBlockNumber(blockNumber ? Number(blockNumber) : undefined)
    if (!debouncedBlock && blockNumber) {
      setDebouncedBlock(Number(blockNumber))
    }
  }, [blockNumber])

  return null
}

export default AtomUpdater
