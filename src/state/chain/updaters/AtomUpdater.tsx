import '@rainbow-me/rainbowkit/styles.css'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useEffect } from 'react'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  blockAtom,
  blockTimestampAtom,
  chainIdAtom,
  debouncedBlockAtom,
  isSafeMultisigAtom,
  timestampAtom,
  walletAtom,
  walletChainAtom,
} from 'state/atoms'
import { useAccount, useBlockNumber, usePublicClient } from 'wagmi'
import { Address } from 'viem'

// Keep web3 state in sync with atoms
const AtomUpdater = () => {
  const account = useAccount()

  // Setters
  const setWallet = useSetAtom(walletAtom)
  const setWalletChain = useSetAtom(walletChainAtom)
  const setIsSafeMultisig = useSetAtom(isSafeMultisigAtom)
  const setBlockNumber = useSetAtom(blockAtom)
  const chainId = useAtomValue(chainIdAtom)
  const { data: blockNumber } = useBlockNumber({ watch: true, chainId })
  const client = usePublicClient({ chainId: account?.chainId })
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
      // Check if the wallet is a Safe Multisig
      const checkIfSafe = async () => {
        try {
          if (!client) return
          // Safe contracts have a specific bytecode pattern
          const code = await client.getCode({
            address: account.address as Address,
          })
          // If code is undefined or '0x', it's not a contract
          const isSafe =
            typeof code === 'string' && code !== '0x' && code.length > 2
          setIsSafeMultisig(isSafe)
          console.log('Is Safe Multisig:', isSafe)
        } catch (e) {
          console.log('Error checking if wallet is Safe:', e)
          setIsSafeMultisig(false)
        }
      }

      checkIfSafe()
    } else {
      setWallet(null)
      setWalletChain(undefined)
      setIsSafeMultisig(false)
    }
  }, [account?.address, account?.chainId, client?.chain?.id])

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
