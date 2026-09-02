import '@rainbow-me/rainbowkit/styles.css'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useEffect, useRef } from 'react'

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
import { useAccount, useBlock, usePublicClient } from 'wagmi'
import { linkWalletToReferral } from 'utils/referral'
import { trackActivityEvent } from '@/utils/activity-events'
import { Address } from 'viem'

// Keep web3 state in sync with atoms
const AtomUpdater = () => {
  const account = useAccount()
  const connectedAddressRef = useRef<Address>()

  // Setters
  const setWallet = useSetAtom(walletAtom)
  const setWalletChain = useSetAtom(walletChainAtom)
  const setIsSafeMultisig = useSetAtom(isSafeMultisigAtom)
  const setBlockNumber = useSetAtom(blockAtom)
  const chainId = useAtomValue(chainIdAtom)
  const { data: block } = useBlock({ watch: true, chainId })
  const walletClient = usePublicClient({ chainId: account?.chainId })
  const setBlockTimestamp = useSetAtom(blockTimestampAtom)
  const [timestamp, setTimestamp] = useAtom(timestampAtom)
  const [debouncedBlock, setDebouncedBlock] = useAtom(debouncedBlockAtom)

  useEffect(() => {
    if (account && account.address) {
      setWallet(account.address)
      setWalletChain(account.chainId)
      mixpanel.register({
        wa: account.address,
      })
      linkWalletToReferral(account.address)
      if (
        connectedAddressRef.current?.toLowerCase() !==
        account.address.toLowerCase()
      ) {
        connectedAddressRef.current = account.address
        void trackActivityEvent({
          type: 'wallet_connected',
          wallet: account.address,
          chainId: account.chainId ?? chainId,
          connector: account.connector?.name?.slice(0, 50),
        })
      }
      // Check if the wallet is a Safe Multisig
      const checkIfSafe = async () => {
        try {
          if (!walletClient) return
          // Safe contracts have a specific bytecode pattern
          const code = await walletClient.getCode({
            address: account.address as Address,
          })
          // If code is undefined or '0x', it's not a contract
          const isSafe =
            typeof code === 'string' && code !== '0x' && code.length > 2
          setIsSafeMultisig(isSafe)
        } catch (e) {
          console.error('Error checking if wallet is Safe:', e)
          setIsSafeMultisig(false)
        }
      }

      checkIfSafe()
    } else {
      connectedAddressRef.current = undefined
      setWallet(null)
      setWalletChain(undefined)
      setIsSafeMultisig(false)
    }
  }, [account?.address, account?.chainId, walletClient?.chain?.id])

  useEffect(() => {
    if (!block) {
      setBlockNumber(undefined)
      return
    }

    const blockNumber = Number(block.number)
    const blockTimestamp = Number(block.timestamp)

    setBlockNumber(blockNumber)
    setBlockTimestamp(blockTimestamp)

    // TODO: set to a realistic value?
    // TODO: going to use this atom for all values that are updated live~
    if (blockTimestamp - timestamp > 50) {
      setTimestamp(blockTimestamp)
    }

    if (blockTimestamp - timestamp > 20 || !debouncedBlock) {
      setDebouncedBlock(blockNumber)
    }
  }, [block?.number])

  return null
}

export default AtomUpdater
